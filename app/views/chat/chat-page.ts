import { EventData, Page } from '@nativescript/core';
import { ChatViewModel } from './chat-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new ChatViewModel();
}

export function onUnloaded(args: EventData) {
    const page = <Page>args.object;
    const vm = page.bindingContext as ChatViewModel;
    vm.onUnloaded();
}