import { Observable, Frame } from '@nativescript/core';
import { VideoLessonService, VideoLesson, VideoQuizQuestion } from '../../services/video-lesson-service';
import { AuthService } from '../../services/auth-service';
import { ErrorHandler } from '../../utils/error-handler';
import { logger } from '../../utils/logger';

export class VideoLessonViewModel extends Observable {
    private videoLessonService: VideoLessonService;
    private authService: AuthService;
    private _lesson: VideoLesson | null = null;
    private _currentQuestionIndex: number = 0;
    private _showQuiz: boolean = false;
    private _showTranscript: boolean = false;
    private _isAnswered: boolean = false;
    private _isCorrect: boolean = false;
    private _earnedPoints: number = 0;
    private _progress: number = 0;
    private _selectedAnswer: string = '';
    private lastProgressUpdate: number = 0;
    private progressUpdateInterval: number = 5000; // Update every 5 seconds

    constructor(lessonId: string) {
        super();
        this.videoLessonService = VideoLessonService.getInstance();
        this.authService = AuthService.getInstance();
        this.loadLesson(lessonId);
    }

    get lesson(): VideoLesson | null {
        return this._lesson;
    }

    get showQuiz(): boolean {
        return this._showQuiz;
    }

    set showQuiz(value: boolean) {
        if (this._showQuiz !== value) {
            this._showQuiz = value;
            this.notifyPropertyChange('showQuiz', value);
        }
    }

    get showTranscript(): boolean {
        return this._showTranscript;
    }

    set showTranscript(value: boolean) {
        if (this._showTranscript !== value) {
            this._showTranscript = value;
            this.notifyPropertyChange('showTranscript', value);
        }
    }

    get currentQuestion(): VideoQuizQuestion | null {
        return this._lesson?.quiz[this._currentQuestionIndex] || null;
    }

    get currentQuestionIndex(): number {
        return this._currentQuestionIndex;
    }

    get totalQuestions(): number {
        return this._lesson?.quiz.length || 0;
    }

    get isLastQuestion(): boolean {
        return this._currentQuestionIndex === (this.totalQuestions - 1);
    }

    get isAnswered(): boolean {
        return this._isAnswered;
    }

    get isCorrect(): boolean {
        return this._isCorrect;
    }

    get earnedPoints(): number {
        return this._earnedPoints;
    }

    get progress(): number {
        return this._progress;
    }

    get selectedAnswer(): string {
        return this._selectedAnswer;
    }

    private async loadLesson(lessonId: string): Promise<void> {
        try {
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                logger.error('[VideoLessonViewModel] No user logged in');
                return;
            }

            const [lesson, progress] = await Promise.all([
                this.videoLessonService.getVideoLesson(lessonId),
                this.videoLessonService.getVideoProgress(currentUser.uid, lessonId)
            ]);

            if (!lesson) {
                throw new Error('Lesson not found');
            }

            this._lesson = lesson;
            this.notifyPropertyChange('lesson', lesson);

            if (progress) {
                this._progress = (progress.quizResults.filter(r => r.correct).length / lesson.quiz.length) * 100;
                this.notifyPropertyChange('progress', this._progress);
            }

            logger.info('[VideoLessonViewModel] Lesson loaded successfully');
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonViewModel.loadLesson');
        }
    }

    async onAnswerSelected(args: any): Promise<void> {
        if (this._isAnswered || !this.currentQuestion) return;

        try {
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser || !this._lesson) return;

            this._selectedAnswer = args.object.text;
            this.notifyPropertyChange('selectedAnswer', this._selectedAnswer);

            const result = await this.videoLessonService.submitQuizAnswer(
                currentUser.uid,
                this._lesson.id,
                this.currentQuestion.id,
                this._selectedAnswer
            );

            this._isAnswered = true;
            this._isCorrect = result.correct;
            this._earnedPoints = result.points;

            this.notifyPropertyChange('isAnswered', true);
            this.notifyPropertyChange('isCorrect', result.correct);
            this.notifyPropertyChange('earnedPoints', result.points);

            // Update progress
            this._progress = (this._currentQuestionIndex + 1) / this.totalQuestions * 100;
            this.notifyPropertyChange('progress', this._progress);

            logger.info(`[VideoLessonViewModel] Answer submitted: ${result.correct ? 'correct' : 'incorrect'}`);
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonViewModel.onAnswerSelected');
        }
    }

    onContinue(): void {
        if (!this._lesson) return;

        this._isAnswered = false;
        this._selectedAnswer = '';
        this.notifyPropertyChange('isAnswered', false);
        this.notifyPropertyChange('selectedAnswer', '');

        if (this._currentQuestionIndex < this._lesson.quiz.length - 1) {
            this._currentQuestionIndex++;
            this.notifyPropertyChange('currentQuestion', this.currentQuestion);
            this.notifyPropertyChange('currentQuestionIndex', this._currentQuestionIndex);
            this.notifyPropertyChange('isLastQuestion', this.isLastQuestion);
        } else {
            this.showQuiz = false;
            this.completeLesson();
        }
    }

    onTranscriptTap(): void {
        this.showTranscript = true;
    }

    onTranscriptClose(): void {
        this.showTranscript = false;
    }

    async updateProgress(position: number, duration: number): Promise<void> {
        const now = Date.now();
        if (now - this.lastProgressUpdate < this.progressUpdateInterval) return;

        try {
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser || !this._lesson) return;

            await this.videoLessonService.updateWatchProgress(
                currentUser.uid,
                this._lesson.id,
                position,
                duration
            );

            this.lastProgressUpdate = now;
        } catch (error) {
            logger.error('[VideoLessonViewModel] Error updating progress:', error);
        }
    }

    private async completeLesson(): Promise<void> {
        try {
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser || !this._lesson) return;

            await this.videoLessonService.completeLesson(currentUser.uid, this._lesson.id);
            logger.info('[VideoLessonViewModel] Lesson completed successfully');
            
            const topmost = Frame.topmost();
            if (topmost) {
                topmost.goBack();
            }
        } catch (error) {
            ErrorHandler.handleError(error, 'VideoLessonViewModel.completeLesson');
        }
    }

    onVideoComplete(): void {
        this.showQuiz = true;
    }
}