import { EventData, Page } from '@nativescript/core';
import { PracticeViewModel } from './practice-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new PracticeViewModel();
}