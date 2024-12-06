import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get, push } from '@nativescript/firebase-database';

export interface Flashcard {
    id: string;
    word: string;
    definition: string;
    example: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    lastReviewed?: string;
    nextReview?: string;
    correctCount: number;
    incorrectCount: number;
}

export interface FlashcardDeck {
    id: string;
    name: string;
    description: string;
    category: string;
    cardCount: number;
    progress: number;
}

export class FlashcardService {
    private database = getDatabase();
    private static instance: FlashcardService;

    private constructor() {}

    static getInstance(): FlashcardService {
        if (!FlashcardService.instance) {
            FlashcardService.instance = new FlashcardService();
        }
        return FlashcardService.instance;
    }

    async createDeck(userId: string, deck: Omit<FlashcardDeck, 'id'>): Promise<string> {
        try {
            const decksRef = ref(this.database, `users/${userId}/flashcardDecks`);
            const newDeckRef = push(decksRef);
            const deckId = newDeckRef.key!;
            
            await set(newDeckRef, {
                ...deck,
                id: deckId,
                cardCount: 0,
                progress: 0
            });

            return deckId;
        } catch (error) {
            console.error('[FlashcardService] Error creating deck:', error);
            throw error;
        }
    }

    async addCard(userId: string, deckId: string, card: Omit<Flashcard, 'id'>): Promise<string> {
        try {
            const cardsRef = ref(this.database, `users/${userId}/flashcardDecks/${deckId}/cards`);
            const newCardRef = push(cardsRef);
            const cardId = newCardRef.key!;

            await set(newCardRef, {
                ...card,
                id: cardId,
                correctCount: 0,
                incorrectCount: 0,
                lastReviewed: new Date().toISOString()
            });

            // Update deck card count
            const deckRef = ref(this.database, `users/${userId}/flashcardDecks/${deckId}`);
            const deckSnapshot = await get(deckRef);
            const deck = deckSnapshot.val();
            await set(deckRef, {
                ...deck,
                cardCount: (deck.cardCount || 0) + 1
            });

            return cardId;
        } catch (error) {
            console.error('[FlashcardService] Error adding card:', error);
            throw error;
        }
    }

    async updateCardProgress(
        userId: string,
        deckId: string,
        cardId: string,
        isCorrect: boolean
    ): Promise<void> {
        try {
            const cardRef = ref(this.database, `users/${userId}/flashcardDecks/${deckId}/cards/${cardId}`);
            const cardSnapshot = await get(cardRef);
            const card = cardSnapshot.val();

            const updates = {
                correctCount: isCorrect ? (card.correctCount + 1) : card.correctCount,
                incorrectCount: isCorrect ? card.incorrectCount : (card.incorrectCount + 1),
                lastReviewed: new Date().toISOString(),
                nextReview: this.calculateNextReview(isCorrect)
            };

            await set(cardRef, { ...card, ...updates });
        } catch (error) {
            console.error('[FlashcardService] Error updating card progress:', error);
            throw error;
        }
    }

    private calculateNextReview(wasCorrect: boolean): string {
        const now = new Date();
        if (!wasCorrect) {
            // Review again in 1 hour if incorrect
            now.setHours(now.getHours() + 1);
        } else {
            // Spaced repetition: review in 1 day, 3 days, 7 days, etc.
            now.setDate(now.getDate() + 1);
        }
        return now.toISOString();
    }

    async getDueCards(userId: string, deckId: string): Promise<Flashcard[]> {
        try {
            const cardsRef = ref(this.database, `users/${userId}/flashcardDecks/${deckId}/cards`);
            const snapshot = await get(cardsRef);
            
            const now = new Date();
            const cards: Flashcard[] = [];
            
            snapshot.forEach((child) => {
                const card = child.val();
                if (!card.nextReview || new Date(card.nextReview) <= now) {
                    cards.push(card);
                }
            });
            
            return cards;
        } catch (error) {
            console.error('[FlashcardService] Error getting due cards:', error);
            return [];
        }
    }

    async getUserDecks(userId: string): Promise<FlashcardDeck[]> {
        try {
            const decksRef = ref(this.database, `users/${userId}/flashcardDecks`);
            const snapshot = await get(decksRef);
            
            const decks: FlashcardDeck[] = [];
            snapshot.forEach((child) => {
                decks.push(child.val());
            });
            
            return decks;
        } catch (error) {
            console.error('[FlashcardService] Error getting user decks:', error);
            return [];
        }
    }
}