import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';

export class HomeViewModel extends Observable {
    private _lessons: any[];
    private _userPoints: number;
    private _dailyProgress: string;

    constructor() {
        super();
        this._userPoints = 100;
        this._dailyProgress = '60%';
        this._lessons = [
            {
                id: '1',
                title: "Basic Greetings",
                description: "Learn common English greetings",
                duration: "5 min",
                points: 20,
                thumbnail: "~/assets/lessons/greetings.png",
                videoUrl: "https://example.com/greetings.mp4",
                quiz: [
                    {
                        question: "How do you say 'Hello' in English?",
                        options: ["Hello", "Goodbye", "Thank you", "Please"],
                        correctAnswer: "Hello",
                        explanation: "Hello is the most common greeting in English."
                    }
                ]
            },
            {
                id: '2',
                title: "Ordering Food",
                description: "Practice restaurant conversations",
                duration: "8 min",
                points: 30,
                thumbnail: "~/assets/lessons/food.png",
                videoUrl: "https://example.com/food.mp4",
                quiz: [
                    {
                        question: "What's a polite way to order food?",
                        options: ["I want this", "Could I have", "Give me", "Food now"],
                        correctAnswer: "Could I have",
                        explanation: "Using 'Could I have' is a polite way to make a request."
                    }
                ]
            },
            {
                id: '3',
                title: "Daily Routines",
                description: "Talk about your daily activities",
                duration: "6 min",
                points: 25,
                thumbnail: "~/assets/lessons/routines.png",
                videoUrl: "https://example.com/routines.mp4",
                quiz: [
                    {
                        question: "What time do you usually wake up?",
                        options: ["I wake up", "I waking up", "I am wake up", "I waked up"],
                        correctAnswer: "I wake up",
                        explanation: "Use the simple present tense for daily routines."
                    }
                ]
            }
        ];

        this.notifyPropertyChange('lessons', this._lessons);
        this.notifyPropertyChange('userPoints', this._userPoints);
        this.notifyPropertyChange('dailyProgress', this._dailyProgress);
    }

    get lessons(): any[] {
        return this._lessons;
    }

    get userPoints(): number {
        return this._userPoints;
    }

    get dailyProgress(): string {
        return this._dailyProgress;
    }

    onLessonTap(args: any) {
        if (!args || typeof args.index !== 'number' || !this._lessons[args.index]) {
            console.error('Invalid lesson selection');
            return;
        }

        const lesson = this._lessons[args.index];
        Frame.topmost().navigate({
            moduleName: "views/lessons/lesson-player",
            context: lesson
        });
    }
}