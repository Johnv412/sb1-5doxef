import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { LessonService, Quiz } from '../../services/lesson-service';
import { AuthService } from '../../services/auth-service';

interface LessonData {
    id: string;
    videoUrl: string;
    title: string;
    quiz: Quiz[];
    points: number;
}

export class LessonPlayerViewModel extends Observable {
    private _videoUrl: string;
    private _title: string;
    private _currentQuiz: Quiz | null = null;
    private _quizzes: Quiz[];
    private _currentQuizIndex: number = 0;
    private _showQuiz: boolean = false;
    private _points: number = 0;
    private lessonService: LessonService;
    private authService: AuthService;
    private lessonId: string;

    constructor(lessonData: LessonData | null) {
        super();
        
        this.lessonService = new LessonService();
        this.authService = new AuthService();
        
        if (lessonData) {
            this._videoUrl = lessonData.videoUrl || '';
            this._title = lessonData.title || 'Lesson';
            this.lessonId = lessonData.id || '';
            this._quizzes = Array.isArray(lessonData.quiz) ? lessonData.quiz : [];
            this._points = typeof lessonData.points === 'number' ? lessonData.points : 0;
        } else {
            this._videoUrl = '';
            this._title = 'Lesson';
            this.lessonId = '';
            this._quizzes = [];
            this._points = 0;
        }
        
        this.notifyPropertyChange('videoUrl', this._videoUrl);
        this.notifyPropertyChange('title', this._title);
        this.notifyPropertyChange('showQuiz', this._showQuiz);
    }

    get videoUrl(): string {
        return this._videoUrl;
    }

    get title(): string {
        return this._title;
    }

    get currentQuiz(): Quiz | null {
        return this._currentQuiz;
    }

    get showQuiz(): boolean {
        return this._showQuiz;
    }

    onVideoComplete(): void {
        if (!this._quizzes || this._quizzes.length === 0) {
            console.log('No quizzes available');
            return;
        }

        this._showQuiz = true;
        this._currentQuiz = this._quizzes[this._currentQuizIndex];
        this.notifyPropertyChange('showQuiz', this._showQuiz);
        this.notifyPropertyChange('currentQuiz', this._currentQuiz);
    }

    async onAnswerSelected(args: { object: { text: string } } | null): Promise<void> {
        if (!args?.object?.text || !this._currentQuiz) {
            console.error('Invalid answer selection or quiz not available');
            return;
        }

        const selectedAnswer = args.object.text;
        const isCorrect = selectedAnswer === this._currentQuiz.correctAnswer;

        if (isCorrect) {
            await this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
    }

    private async handleCorrectAnswer(): Promise<void> {
        const user = this.authService.getCurrentUser();
        if (!user || !this.lessonId) {
            console.error('User not authenticated or lesson ID not available');
            return;
        }

        try {
            await this.lessonService.updateUserProgress(user.uid, this.lessonId, this._points);
            this.showSuccessAndNavigateBack();
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    private handleIncorrectAnswer(): void {
        this.showFeedbackDialog();
    }

    private showSuccessAndNavigateBack(): void {
        const topmost = Frame.topmost();
        if (topmost) {
            topmost.goBack();
        }
    }

    private showFeedbackDialog(): void {
        // Implement feedback dialog
    }
}