import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, push, onValue, off, Query } from '@nativescript/firebase-database';

export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string;
}

export class ChatService {
    private database = getDatabase();

    async sendMessage(userId: string, username: string, message: string): Promise<void> {
        const chatRef = ref(this.database, 'chat');
        await push(chatRef, {
            userId,
            username,
            message,
            timestamp: new Date().toISOString()
        });
    }

    subscribeToMessages(callback: (messages: ChatMessage[]) => void): () => void {
        const chatRef = ref(this.database, 'chat');
        
        const handler = onValue(chatRef, (snapshot) => {
            const messages: ChatMessage[] = [];
            snapshot.forEach((child) => {
                messages.push({
                    id: child.key,
                    ...child.val()
                });
            });
            callback(messages.sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ));
        });

        return () => off(chatRef as Query);
    }
}