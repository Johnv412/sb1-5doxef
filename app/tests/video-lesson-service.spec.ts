import { VideoLessonService } from '../services/video-lesson-service';

describe('VideoLessonService', () => {
    let service: VideoLessonService;
    const userId = 'test-user';
    const lessonId = 'test-lesson';

    beforeEach(() => {
        service = VideoLessonService.getInstance();
    });

    describe('submitQuizAnswer', () => {
        it('should calculate points correctly based on attempts', async () => {
            const result = await service.submitQuizAnswer(
                userId,
                lessonId,
                'question-1',
                'correct-answer'
            );
            expect(result.correct).toBe(true);
            expect(result.points).toBeGreaterThan(0);
        });

        it('should handle incorrect answers', async () => {
            const result = await service.submitQuizAnswer(
                userId,
                lessonId,
                'question-1',
                'wrong-answer'
            );
            expect(result.correct).toBe(false);
            expect(result.points).toBe(0);
        });
    });

    describe('completeLesson', () => {
        it('should require all questions to be answered correctly', async () => {
            await expect(service.completeLesson(userId, lessonId))
                .rejects
                .toThrow('All quiz questions must be answered correctly');
        });
    });
});