import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get } from '@nativescript/firebase-database';

export class StreakService {
    private database = getDatabase();
    private static instance: StreakService;

    private constructor() {}

    static getInstance(): StreakService {
        if (!StreakService.instance) {
            StreakService.instance = new StreakService();
        }
        return StreakService.instance;
    }

    async updateStreak(userId: string): Promise<number> {
        try {
            const streakRef = ref(this.database, `users/${userId}/streak`);
            const lastLoginRef = ref(this.database, `users/${userId}/lastLoginDate`);

            const lastLoginSnapshot = await get(lastLoginRef);
            const lastLoginDate = lastLoginSnapshot.val();
            const today = new Date().toISOString().split('T')[0];

            if (lastLoginDate === today) {
                return (await get(streakRef)).val() || 0;
            }

            let newStreak = 1;
            if (lastLoginDate) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (yesterdayStr === lastLoginDate) {
                    const currentStreak = (await get(streakRef)).val() || 0;
                    newStreak = currentStreak + 1;
                }
            }

            await set(streakRef, newStreak);
            await set(lastLoginRef, today);

            return newStreak;
        } catch (error) {
            console.error('[StreakService] Error updating streak:', error);
            return 0;
        }
    }

    async getStreak(userId: string): Promise<number> {
        try {
            const streakRef = ref(this.database, `users/${userId}/streak`);
            const snapshot = await get(streakRef);
            return snapshot.val() || 0;
        } catch (error) {
            console.error('[StreakService] Error getting streak:', error);
            return 0;
        }
    }
}