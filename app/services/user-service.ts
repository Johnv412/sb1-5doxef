import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get } from '@nativescript/firebase-database';

export interface UserProfile {
    id: string;
    email: string;
    level: string;
    points: number;
    dailyGoal: number;
    streak: number;
    lastActive: string;
}

export class UserService {
    private database = getDatabase();

    async createProfile(userId: string, email: string, level: string): Promise<void> {
        const userRef = ref(this.database, `users/${userId}`);
        await set(userRef, {
            id: userId,
            email,
            level,
            points: 0,
            dailyGoal: 50,
            streak: 0,
            lastActive: new Date().toISOString()
        });
    }

    async updatePoints(userId: string, points: number): Promise<void> {
        const pointsRef = ref(this.database, `users/${userId}/points`);
        const currentPoints = (await get(pointsRef)).val() || 0;
        await set(pointsRef, currentPoints + points);
    }

    async getProfile(userId: string): Promise<UserProfile | null> {
        const userRef = ref(this.database, `users/${userId}`);
        const snapshot = await get(userRef);
        return snapshot.val();
    }

    async updateDailyStreak(userId: string): Promise<void> {
        const userRef = ref(this.database, `users/${userId}`);
        const user = (await get(userRef)).val();
        
        const lastActive = new Date(user.lastActive);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        let newStreak = user.streak;
        if (diffDays === 1) {
            newStreak += 1;
        } else if (diffDays > 1) {
            newStreak = 0;
        }
        
        await set(userRef, {
            ...user,
            streak: newStreak,
            lastActive: today.toISOString()
        });
    }
}