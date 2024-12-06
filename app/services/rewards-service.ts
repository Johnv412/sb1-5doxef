import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get, push } from '@nativescript/firebase-database';

export interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: 'content' | 'feature' | 'cosmetic';
    icon: string;
    available: boolean;
}

export interface UserReward {
    rewardId: string;
    redeemedAt: string;
    expiresAt?: string;
}

export class RewardsService {
    private database = getDatabase();
    private static instance: RewardsService;
    private rewards: Reward[] = [
        {
            id: 'extra-lesson-1',
            name: 'Business English Pack',
            description: 'Unlock 5 additional business English lessons',
            cost: 500,
            type: 'content',
            icon: '~/assets/rewards/business.png',
            available: true
        },
        {
            id: 'streak-shield',
            name: 'Streak Shield',
            description: 'Protect your streak for one missed day',
            cost: 300,
            type: 'feature',
            icon: '~/assets/rewards/shield.png',
            available: true
        },
        {
            id: 'premium-theme',
            name: 'Premium Theme',
            description: 'Unlock a special dark theme for the app',
            cost: 200,
            type: 'cosmetic',
            icon: '~/assets/rewards/theme.png',
            available: true
        }
    ];

    private constructor() {}

    static getInstance(): RewardsService {
        if (!RewardsService.instance) {
            RewardsService.instance = new RewardsService();
        }
        return RewardsService.instance;
    }

    async getAvailableRewards(): Promise<Reward[]> {
        try {
            return this.rewards.filter(reward => reward.available);
        } catch (error) {
            console.error('[RewardsService] Error getting rewards:', error);
            return [];
        }
    }

    async getUserRewards(userId: string): Promise<UserReward[]> {
        try {
            const rewardsRef = ref(this.database, `users/${userId}/rewards`);
            const snapshot = await get(rewardsRef);
            
            const rewards: UserReward[] = [];
            snapshot.forEach((child) => {
                rewards.push(child.val());
            });
            
            return rewards;
        } catch (error) {
            console.error('[RewardsService] Error getting user rewards:', error);
            return [];
        }
    }

    async redeemReward(userId: string, rewardId: string, currentPoints: number): Promise<boolean> {
        try {
            const reward = this.rewards.find(r => r.id === rewardId);
            if (!reward) {
                throw new Error('Reward not found');
            }

            if (currentPoints < reward.cost) {
                throw new Error('Insufficient points');
            }

            const rewardsRef = ref(this.database, `users/${userId}/rewards`);
            await push(rewardsRef, {
                rewardId,
                redeemedAt: new Date().toISOString(),
                expiresAt: this.calculateExpiryDate(reward.type)
            });

            // Deduct points
            const pointsRef = ref(this.database, `users/${userId}/profile/points`);
            await set(pointsRef, currentPoints - reward.cost);

            return true;
        } catch (error) {
            console.error('[RewardsService] Error redeeming reward:', error);
            throw error;
        }
    }

    private calculateExpiryDate(rewardType: string): string | undefined {
        switch (rewardType) {
            case 'feature':
                // Features expire after 30 days
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30);
                return expiryDate.toISOString();
            default:
                return undefined; // Permanent rewards
        }
    }
}