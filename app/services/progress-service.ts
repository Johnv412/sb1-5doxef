import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get } from '@nativescript/firebase-database';
import { Lesson } from './lesson-service';

export interface Progress {
    completedLessons: number;
    totalLessons: number;
    lastCompletedLesson: string;
    percentComplete: number;
}

export class ProgressService {
    private database = getDatabase();
    private static instance: ProgressService;

    private constructor() {}

    static getInstance(): ProgressService {
        if (!ProgressService.instance) {
            ProgressService.instance = new ProgressService();
        }
        return ProgressService.instance;
    }

    async updateProgress(userId: string, lessonId: string): Promise<Progress> {
        try {
            const progressRef = ref(this.database, `users/${userId}/progress`);
            const lessonsRef = ref(this.database, 'lessons');

            const [progressSnapshot, lessonsSnapshot] = await Promise.all([
                get(progressRef),
                get(lessonsRef)
            ]);

            const progress = progressSnapshot.val() || { completedLessons: 0 };
            const totalLessons = Object.keys(lessonsSnapshot.val() || {}).length;

            if (!progress.completedLessonIds) {
                progress.completedLessonIds = [];
            }

            if (!progress.completedLessonIds.includes(lessonId)) {
                progress.completedLessonIds.push(lessonId);
                progress.completedLessons = progress.completedLessonIds.length;
                progress.lastCompletedLesson = lessonId;
                progress.percentComplete = (progress.completedLessons / totalLessons) * 100;

                await set(progressRef, progress);
            }

            return {
                completedLessons: progress.completedLessons,
                totalLessons,
                lastCompletedLesson: progress.lastCompletedLesson,
                percentComplete: progress.percentComplete
            };
        } catch (error) {
            console.error('[ProgressService] Error updating progress:', error);
            throw error;
        }
    }

    async getProgress(userId: string): Promise<Progress> {
        try {
            const progressRef = ref(this.database, `users/${userId}/progress`);
            const lessonsRef = ref(this.database, 'lessons');

            const [progressSnapshot, lessonsSnapshot] = await Promise.all([
                get(progressRef),
                get(lessonsRef)
            ]);

            const progress = progressSnapshot.val() || { completedLessons: 0 };
            const totalLessons = Object.keys(lessonsSnapshot.val() || {}).length;

            return {
                completedLessons: progress.completedLessons || 0,
                totalLessons,
                lastCompletedLesson: progress.lastCompletedLesson || '',
                percentComplete: (progress.completedLessons / totalLessons) * 100
            };
        } catch (error) {
            console.error('[ProgressService] Error getting progress:', error);
            throw error;
        }
    }
}