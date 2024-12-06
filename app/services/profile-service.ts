import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get, update } from '@nativescript/firebase-database';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    languageLevel: string;
    points: number;
    streak: number;
    lastLoginDate: string;
    preferences: {
        notifications: boolean;
        dailyGoal: number;
        theme: string;
    };
}

export class ProfileService {
    private database = getDatabase();
    private static instance: ProfileService;

    private constructor() {}

    static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    async createProfile(userId: string, email: string): Promise<UserProfile> {
        const profile: UserProfile = {
            id: userId,
            name: '',
            email,
            languageLevel: 'beginner',
            points: 0,
            streak: 0,
            lastLoginDate: new Date().toISOString(),
            preferences: {
                notifications: true,
                dailyGoal: 20,
                theme: 'light'
            }
        };

        try {
            await set(ref(this.database, `users/${userId}/profile`), profile);
            return profile;
        } catch (error) {
            console.error('[ProfileService] Error creating profile:', error);
            throw error;
        }
    }

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        try {
            await update(ref(this.database, `users/${userId}/profile`), updates);
        } catch (error) {
            console.error('[ProfileService] Error updating profile:', error);
            throw error;
        }
    }

    async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            const snapshot = await get(ref(this.database, `users/${userId}/profile`));
            return snapshot.val();
        } catch (error) {
            console.error('[ProfileService] Error getting profile:', error);
            throw error;
        }
    }

    async addPoints(userId: string, points: number): Promise<number> {
        try {
            const profileRef = ref(this.database, `users/${userId}/profile`);
            const snapshot = await get(profileRef);
            const currentPoints = snapshot.val()?.points || 0;
            const newPoints = currentPoints + points;
            
            await update(profileRef, { points: newPoints });
            return newPoints;
        } catch (error) {
            console.error('[ProfileService] Error adding points:', error);
            throw error;
        }
    }
}