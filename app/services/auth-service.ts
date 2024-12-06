import { firebase } from '@nativescript/firebase-core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User } from '@nativescript/firebase-auth';

export class AuthService {
    private auth: Auth | null = null;
    private static instance: AuthService;

    private constructor() {
        try {
            this.auth = firebase().auth();
        } catch (error) {
            console.error('[AuthService] Initialization error:', error);
        }
    }

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    private validateAuth(): boolean {
        if (!this.auth) {
            console.error('[AuthService] Auth not initialized');
            throw new Error('Authentication service not initialized');
        }
        return true;
    }

    async register(email: string, password: string): Promise<User> {
        this.validateAuth();
        
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth!, email, password);
            console.log('[AuthService] User registered successfully');
            return userCredential.user;
        } catch (error: any) {
            console.error('[AuthService] Registration error:', error);
            throw new Error(this.getReadableErrorMessage(error));
        }
    }

    async login(email: string, password: string): Promise<User> {
        this.validateAuth();

        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        try {
            const userCredential = await signInWithEmailAndPassword(this.auth!, email, password);
            console.log('[AuthService] User logged in successfully');
            return userCredential.user;
        } catch (error: any) {
            console.error('[AuthService] Login error:', error);
            throw new Error(this.getReadableErrorMessage(error));
        }
    }

    async logout(): Promise<void> {
        this.validateAuth();

        try {
            await this.auth!.signOut();
            console.log('[AuthService] User logged out successfully');
        } catch (error) {
            console.error('[AuthService] Logout error:', error);
            throw new Error('Failed to log out');
        }
    }

    getCurrentUser(): User | null {
        this.validateAuth();
        return this.auth!.currentUser;
    }

    private getReadableErrorMessage(error: any): string {
        const errorCode = error.code || '';
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/operation-not-allowed':
                return 'Email/password accounts are not enabled';
            case 'auth/weak-password':
                return 'Password is too weak';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password';
            default:
                return error.message || 'An unexpected error occurred';
        }
    }
}