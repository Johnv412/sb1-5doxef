import { Observable, Frame } from '@nativescript/core';
import { FlashcardService, FlashcardDeck } from '../../services/flashcard-service';
import { AuthService } from '../../services/auth-service';

export class FlashcardsViewModel extends Observable {
    private flashcardService: FlashcardService;
    private authService: AuthService;
    private _isLoading: boolean = false;
    private _decks: FlashcardDeck[] = [];
    private _selectedFilter: string = 'all';

    constructor() {
        super();
        this.flashcardService = FlashcardService.getInstance();
        this.authService = AuthService.getInstance();
        this.loadDecks();
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

    get decks(): FlashcardDeck[] {
        return this._decks;
    }

    set decks(value: FlashcardDeck[]) {
        if (this._decks !== value) {
            this._decks = value;
            this.notifyPropertyChange('decks', value);
            this.notifyPropertyChange('filteredDecks', this.filteredDecks);
        }
    }

    get selectedFilter(): string {
        return this._selectedFilter;
    }

    set selectedFilter(value: string) {
        if (this._selectedFilter !== value) {
            this._selectedFilter = value;
            this.notifyPropertyChange('selectedFilter', value);
            this.notifyPropertyChange('filteredDecks', this.filteredDecks);
        }
    }

    get filteredDecks(): FlashcardDeck[] {
        if (this._selectedFilter === 'all') {
            return this._decks;
        }
        return this._decks.filter(deck => deck.category === this._selectedFilter);
    }

    async loadDecks(): Promise<void> {
        try {
            this.isLoading = true;
            
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('[FlashcardsViewModel] No user logged in');
                return;
            }

            const decks = await this.flashcardService.getUserDecks(currentUser.uid);
            this.decks = decks;
        } catch (error) {
            console.error('[FlashcardsViewModel] Error loading decks:', error);
        } finally {
            this.isLoading = false;
        }
    }

    onFilterTap(args: any): void {
        const button = args.object;
        this.selectedFilter = button.text.toLowerCase();
    }

    onPracticeTap(args: any): void {
        const deck = args.object.bindingContext as FlashcardDeck;
        const topmost = Frame.topmost();
        if (topmost) {
            topmost.navigate({
                moduleName: "views/flashcards/practice-page",
                context: { deckId: deck.id }
            });
        }
    }

    onAddDeck(): void {
        const topmost = Frame.topmost();
        if (topmost) {
            topmost.navigate({
                moduleName: "views/flashcards/add-deck-page"
            });
        }
    }
}