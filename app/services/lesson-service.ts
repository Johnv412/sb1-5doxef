import { firebase } from '@nativescript/firebase-core';
import { getDatabase, ref, set, get, query, orderByChild } from '@nativescript/firebase-database';
import { ErrorHandler } from '../utils/error-handler';

export interface LessonContent {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'audio' | 'text' | 'interactive';
    content: string;
    duration: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    prerequisites: string[];
    tags: string[];
    order: number;
}

export interface Quiz {
    id: string;
    lessonId: string;
    questions: {
        id: string;
        text: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
    }[];
}

export interface LessonProgress {
    completed: boolean;
    score: number;
    timeSpent: number;
    lastAttempt: string;
    attempts: number;
}

export class LessonService {
    private database = getDatabase();
    private static instance: LessonService;

    private constructor() {}

    static getInstance(): LessonService {
        if (!LessonService.instance) {
            LessonService.instance = new LessonService();
        }
        return LessonService.instance;
    }

    async getLessons(userLevel: string): Promise<LessonContent[]> {
        try {
            const lessonsRef = ref(this.database, 'lessons');
            const lessonsQuery = query(lessonsRef, orderByChild('difficulty'));
            const snapshot = await get(lessonsQuery);

            const lessons: LessonContent[] = [];
            snapshot.forEach((child) => {
                const lesson = child.val() as LessonContent;
                if (this.isLessonAppropriate(lesson, userLevel)) {
                    lessons.push(lesson);
                }
            });

            return lessons.sort((a, b) => a.order - b.order);
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonService.getLessons');
            return [];
        }
    }

    private isLessonAppropriate(lesson: LessonContent, userLevel: string): boolean {
        const levels = ['beginner', 'intermediate', 'advanced'];
        const userLevelIndex = levels.indexOf(userLevel.toLowerCase());
        const lessonLevelIndex = levels.indexOf(lesson.difficulty);
        
        // Allow lessons at user's level and one level below
        return lessonLevelIndex <= userLevelIndex;
    }

    async getLesson(lessonId: string): Promise<LessonContent | null> {
        try {
            const lessonRef = ref(this.database, `lessons/${lessonId}`);
            const snapshot = await get(lessonRef);
            return snapshot.val();
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonService.getLesson');
            return null;
        }
    }

    async getQuiz(lessonId: string): Promise<Quiz | null> {
        try {
            const quizRef = ref(this.database, `quizzes/${lessonId}`);
            const snapshot = await get(quizRef);
            return snapshot.val();
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonService.getQuiz');
            return null;
        }
    }

    async updateProgress(userId: string, lessonId: string, progress: LessonProgress): Promise<void> {
        try {
            const progressRef = ref(this.database, `users/${userId}/lessonProgress/${lessonId}`);
            await set(progressRef, {
                ...progress,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonService.updateProgress');
        }
    }

    async getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
        try {
            const progressRef = ref(this.database, `users/${userId}/lessonProgress/${lessonId}`);
            const snapshot = await get(progressRef);
            return snapshot.val();
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonService.getLessonProgress');
            return null;
        }
    }

    async getNextLesson(userId: string, currentLessonId: string): Promise<LessonContent | null> {
        try {
            const currentLesson = await this.getLesson(currentLessonId);
            if (!currentLesson) return null;

            const lessonsRef = ref(this.database, 'lessons');
            const lessonsQuery = query(lessonsRef, orderByChild('order'));
            const snapshot = await get(lessonsQuery);

            let nextLesson: LessonContent | null = null;
            snapshot.forEach((child) => {
                const lesson = child.val() as LessonContent;
                if (lesson.order > currentLesson.order) {
                    if (!nextLesson || lesson.order < nextLesson.order) {
                        nextLesson = lesson;
                    }
                }
            });

            return nextLesson;
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonService.getNextLesson');
            return null;
        }
    }

    async getRecommendedLessons(userId: string): Promise<LessonContent[]> {
        try {
            const userProgressRef = ref(this.database, `users/${userId}/lessonProgress`);
            const progressSnapshot = await get(userProgressRef);
            const completedLessons = new Set<string>();
            
            progressSnapshot.forEach((child) => {
                const progress = child.val() as LessonProgress;
                if (progress.completed) {
                    completedLessons.add(child.key!);
                }
            });

            const lessonsRef = ref(this.database, 'lessons');
            const snapshot = await get(lessonsRef);
            const recommendedLessons: LessonContent[] = [];

            snapshot.forEach((child) => {
                const lesson = child.val() as LessonContent;
                if (!completedLessons.has(lesson.id) && 
                    lesson.prerequisites.every(prereq => completedLessons.has(prereq))) {
                    recommendedLessons.push(lesson);
                }
            });

            return recommendedLessons.sort((a, b) => a.order - b.order);
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonService.getRecommendedLessons');
            return [];
        }
    }
}