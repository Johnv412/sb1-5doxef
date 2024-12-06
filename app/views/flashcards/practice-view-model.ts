import { Observable, Frame } from '@nativescript/core';
import { FlashcardService, Flashcard } from '../../services/flashcard-service';
import { AuthService } from '../../services/auth-service';

export class PracticeViewModel extends Observable {
    private flashcardService: FlashcardService;
    private authService: AuthService;
    private _isLoading: boolean = false;
    private _cards: Flashcard[] = [];
    private _currentIndex: number = 0;
    private _isFlipped: boolean = false;
    private deckId: string;

    constructor(deckId: string) {
        super();
        this.flashcardService = FlashcardService.getInstance();
        this.authService = AuthService.getInstance();
        this.deckId = deckId;
        this.loadCards();
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notifyPropertyChange('isLoading', value);
        }
    }

    get currentCard(): Flashcard | null {
        return this._cards[this._currentIndex] || null;
    }

    get currentIndex(): number {
        return this._currentIndex;
    }

    get totalCards(): number {
        return this._cards.length;
    }

    get isFlipped(): boolean {
        return this._isFlipped;
    }

    set isFlipped(value: boolean) {
        if (this._isFlipped !== value) {
            this._isFlipped = value;
            this.notifyPropertyChange('isFlipped', value);
        }
    }

    get hasCards(): boolean {
        return this._cards.length > 0;
    }

    async loadCards(): Promise<void> {
        try {
            this.isLoading = true;
            
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('[PracticeViewModel] No user logged in');
                return;
            }

            this._cards = await this.flashcardService.getDueCards(currentUser.uid, this.deckId);
            this.notifyPropertyChange('hasCards', this.hasCards);
            if (this.hasCards) {
                this.notifyPropertyChange('currentCard', this.currentCard);
                this.notifyPropertyChange('totalCards', this.totalCards);
            }
        } catch (error) {
            console.error('[PracticeViewModel] Error loading cards:', error);
        } finally {
            this.isLoading = false;
        }
    }

    onReveal(): void {
        this.isFlipped = true;
    }

    async onCorrect(): Promise<void> {
        if (!this.currentCard) return;

        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        try {
            await this.flashcardService.updateCardProgress(
                currentUser.uid,
                this.deckId,
                this.currentCard.id,
                true
            );
            this.nextCard();
        } catch (error) {
            console.error('[PracticeViewModel] Error updating card progress:', error);
        }
    }

    async onIncorrect(): Promise<void> {
        if (!this.currentCard) return;

        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) return;

        try {
            await this.flashcardService.updateCardProgress(
                currentUser.uid,
                this.deckId,
                this.currentCard.id,
                false
            );
            this.nextCard();
        } catch (error) {
            console.error('[PracticeViewModel] Error updating card progress:', error);
        }
    }

    private nextCard(): void {
        this.isFlipped = false;
        if (this._currentIndex < this._cards.length - 1) {
            this._currentIndex++;
            this.notifyPropertyChange('currentCard', this.currentCard);
            this.notifyPropertyChange('currentIndex', this.currentIndex);
        } else {
            // Practice session completed
            const topmost = Frame.topmost();
            if (topmost) {
                topmost.goBack();
            }
        }
    }
}