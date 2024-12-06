import { EventData, Page } from '@nativescript/core';
import { LessonPlayerViewModel } from './lesson-player-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    const context = page.navigationContext;
    page.bindingContext = new LessonPlayerViewModel(context);
}