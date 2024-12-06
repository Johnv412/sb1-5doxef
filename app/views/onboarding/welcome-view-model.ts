import { Observable, Frame, NavigationEntry } from '@nativescript/core';

interface Slide {
    title: string;
    description: string;
}

export class WelcomeViewModel extends Observable {
    private _slides: Slide[];
    private _currentSlide: number;

    constructor() {
        super();
        
        // Initialize with default values
        this._currentSlide = 0;
        this._slides = [
            {
                title: "Learn with Videos",
                description: "Watch short, engaging videos to learn English naturally"
            },
            {
                title: "Practice & Earn",
                description: "Complete challenges and earn points while learning"
            },
            {
                title: "Connect & Grow",
                description: "Join a community of learners and practice together"
            }
        ];

        // Ensure properties are properly initialized
        this.notifyPropertyChange('slides', this._slides);
        this.notifyPropertyChange('currentSlide', this._currentSlide);
    }

    get slides(): Slide[] {
        return this._slides;
    }

    get currentSlide(): number {
        return this._currentSlide;
    }

    onSlideChange(args: { index: number } | null): void {
        if (args && typeof args.index === 'number') {
            this._currentSlide = args.index;
            this.notifyPropertyChange('currentSlide', this._currentSlide);
        }
    }

    onGetStarted(): void {
        const navigationEntry: NavigationEntry = {
            moduleName: "views/onboarding/proficiency-test",
            clearHistory: true,
            animated: true
        };

        const topmost = Frame.topmost();
        if (topmost) {
            topmost.navigate(navigationEntry);
        }
    }

    onLogin(): void {
        const navigationEntry: NavigationEntry = {
            moduleName: "views/auth/login",
            clearHistory: true,
            animated: true
        };

        const topmost = Frame.topmost();
        if (topmost) {
            topmost.navigate(navigationEntry);
        }
    }
}