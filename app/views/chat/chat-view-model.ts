import { Observable } from '@nativescript/core';
import { ChatService, ChatMessage } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';

export class ChatViewModel extends Observable {
    private chatService: ChatService;
    private authService: AuthService;
    private _messages: ChatMessage[] = [];
    private _messageText: string = '';
    private unsubscribe: () => void;

    constructor() {
        super();
        this.chatService = new ChatService();
        this.authService = new AuthService();
        
        this.subscribeToMessages();
    }

    get messages(): ChatMessage[] {
        return this._messages;
    }

    get messageText(): string {
        return this._messageText;
    }

    set messageText(value: string) {
        if (this._messageText !== value) {
            this._messageText = value;
            this.notifyPropertyChange('messageText', value);
        }
    }

    get currentUserId(): string {
        return this.authService.getCurrentUser()?.uid || '';
    }

    private subscribeToMessages() {
        this.unsubscribe = this.chatService.subscribeToMessages((messages) => {
            this._messages = messages;
            this.notifyPropertyChange('messages', messages);
        });
    }

    async onSendMessage() {
        if (!this.messageText.trim()) return;

        const user = this.authService.getCurrentUser();
        if (user) {
            try {
                await this.chatService.sendMessage(
                    user.uid,
                    user.email || 'Anonymous',
                    this.messageText.trim()
                );
                this.messageText = '';
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }

    onUnloaded() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}