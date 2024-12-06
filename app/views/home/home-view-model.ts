import { Observable, Frame } from '@nativescript/core';

export class HomeViewModel extends Observable {
    private _streakCount: number = 5;
    private _progress: number = 60;
    private _continueLessons: any[] = [];
    private _dailyChallengeText: string = "Complete 3 lessons today";

    constructor() {
        super();
        this.loadData();
    }

    get streakCount(): number {
        return this._streakCount;
    }

    get progress(): number {
        return this._progress;
    }

    get progressText(): string {
        return `${this._progress}% Complete`;
    }

    get continueLessons(): any[] {
        return this._continueLessons;
    }

    get dailyChallengeText(): string {
        return this._dailyChallengeText;
    }

    private loadData() {
        // Sample data - in a real app, this would come from a service
        this._continueLessons = [
            {
                title: "Basic Greetings",
                description: "Learn common greetings and introductions",
                progress: 75
            },
            {
                title: "Numbers 1-100",
                description: "Master counting in English",
                progress: 30
            }
        ];
        this.notifyPropertyChange('continueLessons', this._continueLessons);
    }

    onStartLesson() {
        Frame.topmost().navigate({
            moduleName: "views/lessons/lessons-page",
            transition: {
                name: "slide"
            }
        });
    }

    onPractice() {
        Frame.topmost().navigate({
            moduleName: "views/practice/practice-page",
            transition: {
                name: "slide"
            }
        });
    }

    onDailyChallenge() {
        // Implement daily challenge logic
        console.log("Daily challenge tapped");
    }
}