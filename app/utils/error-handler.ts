import { alert } from '@nativescript/core';

export class ErrorHandler {
    static async handleError(error: any, context: string, showAlert: boolean = true): Promise<void> {
        console.error(`[${context}] Error:`, {
            message: error.message,
            code: error.code,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        if (showAlert) {
            await alert({
                title: "Error",
                message: this.getUserFriendlyMessage(error),
                okButtonText: "OK"
            });
        }
    }

    private static getUserFriendlyMessage(error: any): string {
        if (!error) return 'An unexpected error occurred';

        if (error.code?.startsWith('auth/')) {
            return this.getAuthErrorMessage(error.code);
        }

        if (error.message?.includes('network') || error.code === 'EIO') {
            return 'Please check your internet connection';
        }

        if (error.message?.includes('timeout')) {
            return 'The request timed out. Please try again';
        }

        return error.message || 'An unexpected error occurred';
    }

    private static getAuthErrorMessage(code: string): string {
        const messages: { [key: string]: string } = {
            'auth/user-not-found': 'Invalid email or password',
            'auth/wrong-password': 'Invalid email or password',
            'auth/weak-password': 'Password must be at least 6 characters',
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Please enter a valid email address',
            'auth/operation-not-allowed': 'This operation is not allowed',
            'auth/user-disabled': 'This account has been disabled'
        };

        return messages[code] || 'Authentication error occurred';
    }
}