import { ShareFile, ShareText, Utils } from '@nativescript/core';

export class SocialService {
    private static instance: SocialService;

    private constructor() {}

    static getInstance(): SocialService {
        if (!SocialService.instance) {
            SocialService.instance = new SocialService();
        }
        return SocialService.instance;
    }

    async shareProgress(progress: number): Promise<void> {
        try {
            const text = `🎉 I've completed ${progress}% of my English lessons! Join me on Language Learning App! 📚`;
            await ShareText.share({ text, title: 'Share Progress' });
        } catch (error) {
            console.error('[SocialService] Error sharing progress:', error);
            throw error;
        }
    }

    async shareAchievement(achievementTitle: string): Promise<void> {
        try {
            const text = `🏆 I just earned the "${achievementTitle}" achievement in Language Learning App! 🎯`;
            await ShareText.share({ text, title: 'Share Achievement' });
        } catch (error) {
            console.error('[SocialService] Error sharing achievement:', error);
            throw error;
        }
    }

    async shareStreak(days: number): Promise<void> {
        try {
            const text = `🔥 I'm on a ${days}-day learning streak! Join me on Language Learning App! 💪`;
            await ShareText.share({ text, title: 'Share Streak' });
        } catch (error) {
            console.error('[SocialService] Error sharing streak:', error);
            throw error;
        }
    }

    async shareScreenshot(imagePath: string): Promise<void> {
        try {
            await ShareFile.share([{ path: imagePath, title: 'My Progress' }]);
        } catch (error) {
            console.error('[SocialService] Error sharing screenshot:', error);
            throw error;
        }
    }
}