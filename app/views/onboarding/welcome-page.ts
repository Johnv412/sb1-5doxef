import { EventData, Page } from '@nativescript/core';
import { WelcomeViewModel } from './welcome-view-model';

export function onNavigatingTo(args: EventData) {
    if (!args || !args.object) {
        console.error('Navigation event is invalid');
        return;
    }

    const page = args.object as Page;
    if (!page) {
        console.error('Page object is invalid');
        return;
    }

    const viewModel = new WelcomeViewModel();
    page.bindingContext = viewModel;
}