import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get, push } from '@nativescript/firebase-database';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    requirement: {
        type: 'streak' | 'lessons' | 'points';
        value: number;
    };
}

export interface UserAchievement {
    achievementId: string;
    unlockedAt: string;
}

export class AchievementService {
    private database = getDatabase();
    private static instance: AchievementService;
    private achievements: Achievement[] = [
        {
            id: 'first-lesson',
            title: 'First Steps',
            description: 'Complete your first lesson',
            icon: '~/assets/badges/first-lesson.png',
            requirement: { type: 'lessons', value: 1 }
        },
        {
            id: 'streak-7',
            title: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: '~/assets/badges/streak-7.png',
            requirement: { type: 'streak', value: 7 }
        },
        {
            id: 'points-1000',
            title: 'Point Master',
            description: 'Earn 1000 points',
            icon: '~/assets/badges/points-1000.png',
            requirement: { type: 'points', value: 1000 }
        }
    ];

    private constructor() {}

    static getInstance(): AchievementService {
        if (!AchievementService.instance) {
            AchievementService.instance = new AchievementService();
        }
        return AchievementService.instance;
    }

    async checkAchievements(userId: string, stats: {
        lessons: number;
        streak: number;
        points: number;
    }): Promise<Achievement[]> {
        try {
            const userAchievements = await this.getUserAchievements(userId);
            const unlockedAchievements: Achievement[] = [];

            for (const achievement of this.achievements) {
                if (userAchievements.some(ua => ua.achievementId === achievement.id)) {
                    continue;
                }

                const { type, value } = achievement.requirement;
                let isUnlocked = false;

                switch (type) {
                    case 'lessons':
                        isUnlocked = stats.lessons >= value;
                        break;
                    case 'streak':
                        isUnlocked = stats.streak >= value;
                        break;
                    case 'points':
                        isUnlocked = stats.points >= value;
                        break;
                }

                if (isUnlocked) {
                    await this.unlockAchievement(userId, achievement.id);
                    unlockedAchievements.push(achievement);
                }
            }

            return unlockedAchievements;
        } catch (error) {
            console.error('[AchievementService] Error checking achievements:', error);
            return [];
        }
    }

    private async unlockAchievement(userId: string, achievementId: string): Promise<void> {
        try {
            const achievementsRef = ref(this.database, `users/${userId}/achievements`);
            await push(achievementsRef, {
                achievementId,
                unlockedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('[AchievementService] Error unlocking achievement:', error);
            throw error;
        }
    }

    async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        try {
            const achievementsRef = ref(this.database, `users/${userId}/achievements`);
            const snapshot = await get(achievementsRef);
            
            const achievements: UserAchievement[] = [];
            snapshot.forEach((child) => {
                achievements.push(child.val());
            });
            
            return achievements;
        } catch (error) {
            console.error('[AchievementService] Error getting user achievements:', error);
            return [];
        }
    }

    getAllAchievements(): Achievement[] {
        return this.achievements;
    }
}