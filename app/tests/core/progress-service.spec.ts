import { ProgressService } from '../../services/core/progress-service';

describe('ProgressService', () => {
    let service: ProgressService;
    const userId = 'test-user';
    const lessonId = 'test-lesson';

    beforeEach(() => {
        service = ProgressService.getInstance();
    });

    describe('updateProgress', () => {
        it('should calculate progress correctly', async () => {
            // Setup test data
            await service['database'].ref('lessons').set({
                'lesson-1': {},
                'lesson-2': {},
                'lesson-3': {},
                'lesson-4': {}
            });

            const progress = await service.updateProgress(userId, lessonId);
            expect(progress.totalLessons).toBe(4);
            expect(progress.completedLessons).toBe(1);
            expect(progress.percentComplete).toBe(25);
        });

        it('should not count same lesson twice', async () => {
            const progress1 = await service.updateProgress(userId, lessonId);
            const progress2 = await service.updateProgress(userId, lessonId);
            expect(progress1.completedLessons).toBe(progress2.completedLessons);
        });
    });
});