import { BaseService } from '../base-service';
import { ErrorHandler } from '../../utils/error-handler';
import { logger } from '../../utils/logger';

export interface Progress {
    lessonsCompleted: number;
    totalLessons: number;
    lastCompletedLesson: string;
    percentComplete: number;
}

export class ProgressService extends BaseService {
    private static instance: ProgressService;

    private constructor() {
        super();
    }

    static getInstance(): ProgressService {
        if (!ProgressService.instance) {
            ProgressService.instance = new ProgressService();
        }
        return ProgressService.instance;
    }

    async updateProgress(userId: string, lessonId: string): Promise<Progress> {
        try {
            const progressRef = this.database.ref(`users/${userId}/progress`);
            const lessonsRef = this.database.ref('lessons');

            const [progressSnapshot, lessonsSnapshot] = await Promise.all([
                progressRef.once('value'),
                lessonsRef.once('value')
            ]);

            const progress = progressSnapshot.val() || { completedLessons: 0, completedLessonIds: [] };
            const totalLessons = Object.keys(lessonsSnapshot.val() || {}).length;

            if (!progress.completedLessonIds.includes(lessonId)) {
                progress.completedLessonIds.push(lessonId);
                progress.completedLessons = progress.completedLessonIds.length;
                progress.lastCompletedLesson = lessonId;
                progress.percentComplete = (progress.completedLessons / totalLessons) * 100;
                progress.lastUpdated = new Date().toISOString();

                await progressRef.set(progress);
                logger.info(`Progress updated for user ${userId}: ${progress.percentComplete}%`);
            }

            return {
                completedLessons: progress.completedLessons,
                totalLessons,
                lastCompletedLesson: progress.lastCompletedLesson,
                percentComplete: progress.percentComplete
            };
        } catch (error) {
            return this.handleError(error, 'ProgressService.updateProgress');
        }
    }

    async getProgress(userId: string): Promise<Progress> {
        try {
            const [progressSnapshot, lessonsSnapshot] = await Promise.all([
                this.database.ref(`users/${userId}/progress`).once('value'),
                this.database.ref('lessons').once('value')
            ]);

            const progress = progressSnapshot.val() || { completedLessons: 0 };
            const totalLessons = Object.keys(lessonsSnapshot.val() || {}).length;

            return {
                completedLessons: progress.completedLessons,
                totalLessons,
                lastCompletedLesson: progress.lastCompletedLesson || '',
                percentComplete: (progress.completedLessons / totalLessons) * 100
            };
        } catch (error) {
            return this.handleError(error, 'ProgressService.getProgress');
        }
    }
}