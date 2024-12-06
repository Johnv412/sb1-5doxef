import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get, query, orderByChild, limitToLast } from '@nativescript/firebase-database';

export interface LeaderboardEntry {
    userId: string;
    name: string;
    points: number;
    rank?: number;
}

export class LeaderboardService {
    private database = getDatabase();
    private static instance: LeaderboardService;

    private constructor() {}

    static getInstance(): LeaderboardService {
        if (!LeaderboardService.instance) {
            LeaderboardService.instance = new LeaderboardService();
        }
        return LeaderboardService.instance;
    }

    async updateLeaderboard(userId: string, name: string, points: number): Promise<void> {
        try {
            const leaderboardRef = ref(this.database, `leaderboard/${userId}`);
            await set(leaderboardRef, {
                userId,
                name,
                points,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('[LeaderboardService] Error updating leaderboard:', error);
            throw error;
        }
    }

    async getTopUsers(limit: number = 10): Promise<LeaderboardEntry[]> {
        try {
            const leaderboardRef = ref(this.database, 'leaderboard');
            const topUsersQuery = query(leaderboardRef, orderByChild('points'), limitToLast(limit));
            const snapshot = await get(topUsersQuery);
            
            const entries: LeaderboardEntry[] = [];
            snapshot.forEach((child) => {
                entries.push(child.val());
            });

            // Sort by points in descending order and add ranks
            return entries
                .sort((a, b) => b.points - a.points)
                .map((entry, index) => ({
                    ...entry,
                    rank: index + 1
                }));
        } catch (error) {
            console.error('[LeaderboardService] Error getting top users:', error);
            return [];
        }
    }

    async getUserRank(userId: string): Promise<number> {
        try {
            const leaderboardRef = ref(this.database, 'leaderboard');
            const snapshot = await get(leaderboardRef);
            
            const entries: LeaderboardEntry[] = [];
            snapshot.forEach((child) => {
                entries.push(child.val());
            });

            const sortedEntries = entries.sort((a, b) => b.points - a.points);
            const userIndex = sortedEntries.findIndex(entry => entry.userId === userId);
            
            return userIndex === -1 ? -1 : userIndex + 1;
        } catch (error) {
            console.error('[LeaderboardService] Error getting user rank:', error);
            return -1;
        }
    }
}