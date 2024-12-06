import { Observable, Frame } from '@nativescript/core';

export class LessonDetailViewModel extends Observable {
    private _lesson: any;

    constructor(lessonId: string) {
        super();
        this.loadLesson(lessonId);
    }

    get lesson(): any {
        return this._lesson;
    }

    private loadLesson(lessonId: string): void {
        // Simulated API call - replace with actual data fetching
        this._lesson = {
            id: lessonId,
            title: 'Basic Greetings',
            description: 'Learn common greetings and introductions',
            category: 'conversation',
            level: 'beginner',
            duration: '10 min',
            progress: 0,
            isCompleted: false,
            icon: '👋',
            objectives: [
                'Introduce yourself confidently',
                'Use formal and informal greetings',
                'Start basic conversations',
                'Say goodbye appropriately'
            ]
        };
        this.notifyPropertyChange('lesson', this._lesson);
    }

    onStartLesson(): void {
        Frame.topmost().navigate({
            moduleName: "views/lessons/lesson-content-page",
            context: { lessonId: this._lesson.id },
            transition: { name: "slide" }
        });
    }
}