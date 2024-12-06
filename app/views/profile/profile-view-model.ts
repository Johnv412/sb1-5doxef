import { Observable, Frame, Share } from '@nativescript/core';

export class ProfileViewModel extends Observable {
    private _username: string = 'John Doe';
    private _email: string = 'john@example.com';
    private _streak: number = 7;
    private _totalPoints: number = 1250;
    private _rank: string = '#42';
    private _level: number = 5;
    private _xpProgress: string = '2,450 / 3,000 XP';
    private _xpPercentage: number = 82;
    private _lessonsCompleted: number = 24;
    private _exercisesCompleted: number = 156;
    private _timeSpent: string = '32h 15m';
    private _recentAchievements = [
        {
            icon: '🎯',
            title: 'Perfect Week',
            date: '2d ago'
        },
        {
            icon: '🔥',
            title: '7-Day Streak',
            date: 'Today'
        },
        {
            icon: '⭐',
            title: 'Grammar Pro',
            date: '1w ago'
        }
    ];

    constructor() {
        super();
    }

    get username(): string { return this._username; }
    get email(): string { return this._email; }
    get streak(): number { return this._streak; }
    get totalPoints(): number { return this._totalPoints; }
    get rank(): string { return this._rank; }
    get level(): number { return this._level; }
    get xpProgress(): string { return this._xpProgress; }
    get xpPercentage(): number { return this._xpPercentage; }
    get lessonsCompleted(): number { return this._lessonsCompleted; }
    get exercisesCompleted(): number { return this._exercisesCompleted; }
    get timeSpent(): string { return this._timeSpent; }
    get recentAchievements(): any[] { return this._recentAchievements; }

    onSettings(): void {
        Frame.topmost().navigate({
            moduleName: "views/profile/settings-page",
            transition: { name: "slideLeft" }
        });
    }

    async onShareProgress(): Promise<void> {
        try {
            await Share.share({
                title: "My Language Learning Progress",
                text: `I've completed ${this._lessonsCompleted} lessons and earned ${this._totalPoints} points! 🎉`,
                url: "https://languageapp.com"
            });
        } catch (error) {
            console.error('Error sharing progress:', error);
        }
    }

    onViewAchievements(): void {
        Frame.topmost().navigate({
            moduleName: "views/profile/achievements-page",
            transition: { name: "slide" }
        });
    }

    onSignOut(): void {
        // Implement sign out logic
        Frame.topmost().navigate({
            moduleName: "views/auth/login-page",
            clearHistory: true
        });
    }
}