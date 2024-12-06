import { EventData, Page } from '@nativescript/core';
import { LessonDetailViewModel } from './lesson-detail-view-model';

export function onNavigatingTo(args: EventData) {
    const page = <Page>args.object;
    const context = page.navigationContext;
    page.bindingContext = new LessonDetailViewModel(context.lessonId);
}