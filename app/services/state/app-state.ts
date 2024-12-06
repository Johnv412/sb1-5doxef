import { Observable } from '@nativescript/core';

export interface AppState {
    isLoading: boolean;
    currentUser: any | null;
    error: string | null;
}

class AppStateService extends Observable {
    private static instance: AppStateService;
    private state: AppState = {
        isLoading: false,
        currentUser: null,
        error: null
    };

    private constructor() {
        super();
    }

    static getInstance(): AppStateService {
        if (!AppStateService.instance) {
            AppStateService.instance = new AppStateService();
        }
        return AppStateService.instance;
    }

    getState(): AppState {
        return { ...this.state };
    }

    setLoading(loading: boolean): void {
        this.state.isLoading = loading;
        this.notifyPropertyChange('isLoading', loading);
    }

    setError(error: string | null): void {
        this.state.error = error;
        this.notifyPropertyChange('error', error);
    }

    setCurrentUser(user: any | null): void {
        this.state.currentUser = user;
        this.notifyPropertyChange('currentUser', user);
    }
}

export const appState = AppStateService.getInstance();