import { EventData, Page } from '@nativescript/core';
import { LoginViewModel } from './login-view-model';

export function onNavigatingTo(args: EventData) {
    if (!args?.object) {
        console.error('[LoginPage] Navigation event is invalid');
        return;
    }

    const page = args.object as Page;
    if (!page) {
        console.error('[LoginPage] Page object is invalid');
        return;
    }

    try {
        const viewModel = new LoginViewModel();
        page.bindingContext = viewModel;
        console.log('[LoginPage] View model initialized successfully');
    } catch (error) {
        console.error('[LoginPage] Failed to initialize view model:', error);
    }
}