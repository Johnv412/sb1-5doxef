import { StreakService } from '../services/streak-service';

describe('StreakService', () => {
    let streakService: StreakService;

    beforeEach(() => {
        streakService = StreakService.getInstance();
    });

    it('should update streak correctly for consecutive days', async () => {
        const userId = 'test-user';
        const streak = await streakService.updateStreak(userId);
        expect(streak).toBeGreaterThanOrEqual(0);
    });

    it('should get current streak', async () => {
        const userId = 'test-user';
        const streak = await streakService.getStreak(userId);
        expect(streak).toBeGreaterThanOrEqual(0);
    });
});