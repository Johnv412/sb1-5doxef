import { StreakService } from '../../services/core/streak-service';

describe('StreakService', () => {
    let service: StreakService;
    const userId = 'test-user';

    beforeEach(() => {
        service = StreakService.getInstance();
    });

    describe('updateStreak', () => {
        it('should increment streak for consecutive days', async () => {
            // First day
            let streak = await service.updateStreak(userId);
            expect(streak).toBe(1);

            // Simulate next day
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            await service['database'].ref(`users/${userId}/lastLoginDate`)
                .set(yesterday.toISOString().split('T')[0]);

            // Update streak again
            streak = await service.updateStreak(userId);
            expect(streak).toBe(2);
        });

        it('should reset streak after missing a day', async () => {
            // Set last login to 2 days ago
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            await service['database'].ref(`users/${userId}/lastLoginDate`)
                .set(twoDaysAgo.toISOString().split('T')[0]);

            const streak = await service.updateStreak(userId);
            expect(streak).toBe(1);
        });
    });
});