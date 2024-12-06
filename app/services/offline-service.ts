import { knownFolders } from '@nativescript/core';
import { Lesson } from './lesson-service';

export class OfflineService {
    private static instance: OfflineService;
    private offlineFolder = knownFolders.documents().getFolder('offline_lessons');

    private constructor() {
        // Ensure offline folder exists
        if (!this.offlineFolder.contains('lessons.json')) {
            this.offlineFolder.writeTextSync('lessons.json', JSON.stringify([]));
        }
    }

    static getInstance(): OfflineService {
        if (!OfflineService.instance) {
            OfflineService.instance = new OfflineService();
        }
        return OfflineService.instance;
    }

    async saveLesson(lesson: Lesson): Promise<void> {
        try {
            const lessons = this.getOfflineLessons();
            if (!lessons.some(l => l.id === lesson.id)) {
                lessons.push(lesson);
                await this.offlineFolder.writeText(
                    'lessons.json',
                    JSON.stringify(lessons)
                );
            }
        } catch (error) {
            console.error('[OfflineService] Error saving lesson:', error);
            throw error;
        }
    }

    getOfflineLessons(): Lesson[] {
        try {
            const content = this.offlineFolder.getFile('lessons.json').readTextSync();
            return JSON.parse(content);
        } catch (error) {
            console.error('[OfflineService] Error reading offline lessons:', error);
            return [];
        }
    }

    async clearOfflineLessons(): Promise<void> {
        try {
            await this.offlineFolder.writeText('lessons.json', JSON.stringify([]));
        } catch (error) {
            console.error('[OfflineService] Error clearing offline lessons:', error);
            throw error;
        }
    }

    isLessonAvailableOffline(lessonId: string): boolean {
        const lessons = this.getOfflineLessons();
        return lessons.some(lesson => lesson.id === lessonId);
    }
}