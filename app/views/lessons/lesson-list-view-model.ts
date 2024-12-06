import { Observable, Frame } from '@nativescript/core';
import { LessonService, LessonContent, LessonProgress } from '../../services/lesson-service';
import { AuthService } from '../../services/auth-service';
import { ProfileService } from '../../services/profile-service';
import { ErrorHandler } from '../../utils/error-handler';

interface LessonViewModel extends LessonContent {
    progress: number;
    isCompleted: boolean;
}

export class LessonListViewModel extends Observable {
    private lessonService: LessonService;
    private authService: AuthService;
    private profileService: ProfileService;
    private _isLoading: boolean = false;
    private _lessons: LessonViewModel[] = [];
    private _selectedFilter: string = 'all';
    private _userProgress: { [key: string]: LessonProgress } = {};

    constructor() {
        super();
        this.lessonService = LessonService.getInstance();
        this.authService = AuthService.getInstance();
        this.profileService = ProfileService.getInstance();
        this.loadLessons();
    }

    get isLoading(): boolean {
        return this._isLoading;
    }

    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notifyPropertyChange('isLoading', value);
        }
    }

    get lessons(): LessonViewModel[] {
        return this._lessons;
    }

    set lessons(value: LessonViewModel[]) {
        if (this._lessons !== value) {
            this._lessons = value;
            this.notifyPropertyChange('lessons', value);
            this.notifyPropertyChange('filteredLessons', this.filteredLessons);
        }
    }

    get selectedFilter(): string {
        return this._selectedFilter;
    }

    set selectedFilter(value: string) {
        if (this._selectedFilter !== value) {
            this._selectedFilter = value;
            this.notifyPropertyChange('selectedFilter', value);
            this.notifyPropertyChange('filteredLessons', this.filteredLessons);
        }
    }

    get filteredLessons(): LessonViewModel[] {
        switch (this._selectedFilter) {
            case 'inProgress':
                return this._lessons.filter(lesson => 
                    lesson.progress > 0 && !lesson.isCompleted);
            case 'completed':
                return this._lessons.filter(lesson => 
                    lesson.isCompleted);
            case 'recommended':
                return this._lessons.filter(lesson => 
                    !lesson.isCompleted && 
                    lesson.prerequisites.every(prereq => 
                        this._userProgress[prereq]?.completed));
            default:
                return this._lessons;
        }
    }

    async loadLessons(): Promise<void> {
        try {
            this.isLoading = true;
            
            const currentUser = this.authService.getCurrentUser();
            if (!currentUser) {
                console.error('[LessonListViewModel] No user logged in');
                return;
            }

            const userProfile = await this.profileService.getProfile(currentUser.uid);
            if (!userProfile) {
                console.error('[LessonListViewModel] No user profile found');
                return;
            }

            const [lessons, recommendedLessons] = await Promise.all([
                this.lessonService.getLessons(userProfile.languageLevel),
                this.lessonService.getRecommendedLessons(currentUser.uid)
            ]);

            // Load progress for all lessons
            const progressPromises = lessons.map(lesson =>
                this.lessonService.getLessonProgress(currentUser.uid, lesson.id)
            );
            const progressResults = await Promise.all(progressPromises);

            // Create view models with progress information
            this._userProgress = {};
            this.lessons = lessons.map((lesson, index) => {
                const progress = progressResults[index];
                this._userProgress[lesson.id] = progress || {
                    completed: false,
                    score: 0,
                    timeSpent: 0,
                    lastAttempt: '',
                    attempts: 0
                };

                return {
                    ...lesson,
                    progress: progress ? (progress.score || 0) : 0,
                    isCompleted: progress ? progress.completed : false
                };
            });
        } catch (error) {
            ErrorHandler.handleError(error, 'LessonListViewModel.loadLessons');
        } finally {
            this.isLoading = false;
        }
    }

    onFilterTap(args: any): void {
        const button = args.object;
        this.selectedFilter = button.text.toLowerCase();
    }

    onLessonTap(args: any): void {
        const lesson = args.object.bindingContext as LessonViewModel;
        const topmost = Frame.topmost();
        if (topmost) {
            topmost.navigate({
                moduleName: "views/lessons/lesson-player",
                context: { lessonId: lesson.id }
            });
        }
    }
}