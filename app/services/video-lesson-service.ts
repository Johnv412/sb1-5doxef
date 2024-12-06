import { BaseService } from './base-service';
import { ErrorHandler } from '../utils/error-handler';
import { logger } from '../utils/logger';

export interface VideoQuizQuestion {
    id: string;
    timestamp: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface VideoLesson {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    thumbnailUrl: string;
    transcript: string;
    subtitles?: { [language: string]: string };
    quiz: VideoQuizQuestion[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    tags: string[];
    prerequisites: string[];
    nextLessons: string[];
}

export interface VideoProgress {
    lastPosition: number;
    completed: boolean;
    quizResults: {
        questionId: string;
        correct: boolean;
        attemptCount: number;
        lastAttempt: string;
    }[];
    score: number;
    completedAt?: string;
    watchTime: number;
    lastWatched: string;
}

export class VideoLessonService extends BaseService {
    private static instance: VideoLessonService;

    private constructor() {
        super();
    }

    static getInstance(): VideoLessonService {
        if (!VideoLessonService.instance) {
            VideoLessonService.instance = new VideoLessonService();
        }
        return VideoLessonService.instance;
    }

    async getVideoLesson(lessonId: string): Promise<VideoLesson | null> {
        try {
            const lessonRef = this.database.ref(`videoLessons/${lessonId}`);
            const snapshot = await lessonRef.once('value');
            return snapshot.val();
        } catch (error) {
            logger.error('[VideoLessonService] Error fetching video lesson:', error);
            return null;
        }
    }

    async updateWatchProgress(
        userId: string,
        lessonId: string,
        position: number,
        duration: number
    ): Promise<void> {
        try {
            const progressRef = this.database.ref(`users/${userId}/videoProgress/${lessonId}`);
            const currentProgress = (await progressRef.once('value')).val() || {
                lastPosition: 0,
                watchTime: 0,
                completed: false,
                quizResults: []
            };

            const watchTime = currentProgress.watchTime + duration;
            const progress = {
                ...currentProgress,
                lastPosition: position,
                watchTime,
                lastWatched: new Date().toISOString()
            };

            await progressRef.set(progress);
            logger.info(`Updated watch progress for user ${userId}, lesson ${lessonId}`);
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonService.updateWatchProgress');
        }
    }

    async submitQuizAnswer(
        userId: string,
        lessonId: string,
        questionId: string,
        answer: string
    ): Promise<{
        correct: boolean;
        explanation: string;
        points: number;
        nextQuestion?: VideoQuizQuestion;
    }> {
        try {
            const lesson = await this.getVideoLesson(lessonId);
            if (!lesson) throw new Error('Lesson not found');

            const question = lesson.quiz.find(q => q.id === questionId);
            if (!question) throw new Error('Question not found');

            const correct = answer === question.correctAnswer;
            const progress = await this.getVideoProgress(userId, lessonId);
            const quizResults = progress?.quizResults || [];

            const existingResult = quizResults.find(r => r.questionId === questionId);
            const attemptCount = (existingResult?.attemptCount || 0) + 1;

            // Calculate points based on attempts and difficulty
            const pointsMultiplier = this.getPointsMultiplier(question.difficulty);
            const earnedPoints = correct ? Math.max(question.points * pointsMultiplier / attemptCount, 1) : 0;

            await this.updateVideoProgress(userId, lessonId, {
                quizResults: [
                    ...quizResults.filter(r => r.questionId !== questionId),
                    { 
                        questionId, 
                        correct, 
                        attemptCount,
                        lastAttempt: new Date().toISOString()
                    }
                ],
                score: (progress?.score || 0) + earnedPoints
            });

            // Get next question if available
            const currentIndex = lesson.quiz.findIndex(q => q.id === questionId);
            const nextQuestion = lesson.quiz[currentIndex + 1];

            return {
                correct,
                explanation: question.explanation,
                points: earnedPoints,
                nextQuestion: nextQuestion || undefined
            };
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonService.submitQuizAnswer');
            throw error;
        }
    }

    private getPointsMultiplier(difficulty: string): number {
        switch (difficulty) {
            case 'easy': return 1;
            case 'medium': return 1.5;
            case 'hard': return 2;
            default: return 1;
        }
    }

    async getRecommendedLessons(userId: string, limit: number = 5): Promise<VideoLesson[]> {
        try {
            const userProgress = await this.getUserProgress(userId);
            const allLessons = await this.getAllLessons();

            // Filter out completed lessons
            const incompleteLessons = allLessons.filter(lesson => 
                !userProgress[lesson.id]?.completed
            );

            // Sort by prerequisites met and user's level
            const sortedLessons = incompleteLessons.sort((a, b) => {
                const aPrereqsMet = this.checkPrerequisitesMet(a, userProgress);
                const bPrereqsMet = this.checkPrerequisitesMet(b, userProgress);

                if (aPrereqsMet && !bPrereqsMet) return -1;
                if (!aPrereqsMet && bPrereqsMet) return 1;
                return 0;
            });

            return sortedLessons.slice(0, limit);
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonService.getRecommendedLessons');
            return [];
        }
    }

    private checkPrerequisitesMet(
        lesson: VideoLesson, 
        progress: { [key: string]: VideoProgress }
    ): boolean {
        return lesson.prerequisites.every(prereqId => 
            progress[prereqId]?.completed
        );
    }

    private async getAllLessons(): Promise<VideoLesson[]> {
        try {
            const snapshot = await this.database.ref('videoLessons').once('value');
            const lessons: VideoLesson[] = [];
            snapshot.forEach(child => {
                lessons.push(child.val());
            });
            return lessons;
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonService.getAllLessons');
            return [];
        }
    }

    private async getUserProgress(userId: string): Promise<{ [key: string]: VideoProgress }> {
        try {
            const snapshot = await this.database.ref(`users/${userId}/videoProgress`).once('value');
            return snapshot.val() || {};
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonService.getUserProgress');
            return {};
        }
    }
}