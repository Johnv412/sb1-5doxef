import { Observable, Frame } from '@nativescript/core';

interface Lesson {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    progress: number;
    isCompleted: boolean;
    icon: string;
}

export class LessonsViewModel extends Observable {
    private _lessons: Lesson[] = [];
    private _isLoading: boolean = false;
    private _selectedCategory: string = 'all';
    private _selectedLevel: string = 'beginner';

    constructor() {
        super();
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

    get selectedCategory(): string {
        return this._selectedCategory;
    }

    set selectedCategory(value: string) {
        if (this._selectedCategory !== value) {
            this._selectedCategory = value;
            this.notifyPropertyChange('selectedCategory', value);
            this.notifyPropertyChange('filteredLessons', this.filteredLessons);
        }
    }

    get selectedLevel(): string {
        return this._selectedLevel;
    }

    set selectedLevel(value: string) {
        if (this._selectedLevel !== value) {
            this._selectedLevel = value;
            this.notifyPropertyChange('selectedLevel', value);
            this.notifyPropertyChange('filteredLessons', this.filteredLessons);
        }
    }

    get filteredLessons(): Lesson[] {
        return this._lessons.filter(lesson => {
            const categoryMatch = this._selectedCategory === 'all' || 
                                lesson.category === this._selectedCategory;
            const levelMatch = lesson.level === this._selectedLevel;
            return categoryMatch && levelMatch;
        });
    }

    onCategoryTap(args: any): void {
        const button = args.object;
        this.selectedCategory = button.text.toLowerCase();
    }

    onLevelTap(args: any): void {
        const label = args.object;
        this.selectedLevel = label.text.toLowerCase();
    }

    onLessonTap(args: any): void {
        const lesson = args.object.bindingContext as Lesson;
        Frame.topmost().navigate({
            moduleName: "views/lessons/lesson-detail-page",
            context: { lessonId: lesson.id },
            transition: { name: "slide" }
        });
    }

    onSearch(): void {
        Frame.topmost().navigate({
            moduleName: "views/lessons/search-page",
            transition: { name: "slideTop" }
        });
    }

    private async loadLessons(): Promise<void> {
        try {
            this.isLoading = true;
            
            // Simulated API call - replace with actual data fetching
            this._lessons = [
                {
                    id: '1',
                    title: 'Basic Greetings',
                    description: 'Learn common greetings and introductions',
                    category: 'conversation',
                    level: 'beginner',
                    duration: '10 min',
                    progress: 0,
                    isCompleted: false,
                    icon: '👋'
                },
                {
                    id: '2',
                    title: 'Present Simple',
                    description: 'Master the present simple tense',
                    category: 'grammar',
                    level: 'beginner',
                    duration: '15 min',
                    progress: 30,
                    isCompleted: false,
                    icon: '📝'
                },
                {
                    id: '3',
                    title: 'Food Vocabulary',
                    description: 'Essential words for food and restaurants',
                    category: 'vocabulary',
                    level: 'beginner',
                    duration: '12 min',
                    progress: 100,
                    isCompleted: true,
                    icon: '🍽️'
                }
            ];
            
            this.notifyPropertyChange('filteredLessons', this.filteredLessons);
        } catch (error) {
            console.error('Error loading lessons:', error);
        } finally {
            this.isLoading = false;
        }
    }
}