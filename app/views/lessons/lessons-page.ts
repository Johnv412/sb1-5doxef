import { EventData, Page } from '@nativescript/core';
import { LessonsViewModel } from './lessons-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new LessonsViewModel();
}