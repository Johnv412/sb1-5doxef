import { BaseService } from '../base-service';
import { ErrorHandler } from '../../utils/error-handler';
import { logger } from '../../utils/logger';

export class StreakService extends BaseService {
    private static instance: StreakService;

    private constructor() {
        super();
    }

    static getInstance(): StreakService {
        if (!StreakService.instance) {
            StreakService.instance = new StreakService();
        }
        return StreakService.instance;
    }

    async updateStreak(userId: string): Promise<number> {
        try {
            const streakRef = this.database.ref(`users/${userId}/streak`);
            const lastLoginRef = this.database.ref(`users/${userId}/lastLoginDate`);

            const [streakSnapshot, lastLoginSnapshot] = await Promise.all([
                streakRef.once('value'),
                lastLoginRef.once('value')
            ]);

            const currentStreak = streakSnapshot.val() || 0;
            const lastLoginDate = lastLoginSnapshot.val();
            const today = new Date().toISOString().split('T')[0];

            if (lastLoginDate === today) {
                return currentStreak;
            }

            let newStreak = 1;
            if (lastLoginDate) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (yesterdayStr === lastLoginDate) {
                    newStreak = currentStreak + 1;
                    logger.info(`User ${userId} maintained streak: ${newStreak} days`);
                } else {
                    logger.info(`User ${userId} streak reset: missed a day`);
                }
            }

            await Promise.all([
                streakRef.set(newStreak),
                lastLoginRef.set(today)
            ]);

            return newStreak;
        } catch (error) {
            return this.handleError(error, 'StreakService.updateStreak');
        }
    }

    async getStreak(userId: string): Promise<number> {
        try {
            const snapshot = await this.database.ref(`users/${userId}/streak`).once('value');
            return snapshot.val() || 0;
        } catch (error) {
            return this.handleError(error, 'StreakService.getStreak');
        }
    }
}