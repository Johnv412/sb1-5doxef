import { Observable, Frame } from '@nativescript/core';

interface Exercise {
    id: string;
    title: string;
    description: string;
    type: string;
    difficulty: string;
    points: number;
    icon: string;
}

export class PracticeViewModel extends Observable {
    private _exercises: Exercise[] = [];
    private _isLoading: boolean = false;
    private _selectedType: string = 'all';
    private _points: number = 250;

    constructor() {
        super();
        this.loadExercises();
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

    get selectedType(): string {
        return this._selectedType;
    }

    set selectedType(value: string) {
        if (this._selectedType !== value) {
            this._selectedType = value;
            this.notifyPropertyChange('selectedType', value);
            this.notifyPropertyChange('filteredExercises', this.filteredExercises);
        }
    }

    get points(): number {
        return this._points;
    }

    get filteredExercises(): Exercise[] {
        return this._exercises.filter(exercise => 
            this._selectedType === 'all' || exercise.type === this._selectedType
        );
    }

    onTypeTap(args: any): void {
        const button = args.object;
        this.selectedType = button.text.toLowerCase();
    }

    onExerciseTap(args: any): void {
        const exercise = args.object.bindingContext as Exercise;
        Frame.topmost().navigate({
            moduleName: "views/practice/exercise-page",
            context: { exerciseId: exercise.id },
            transition: { name: "slide" }
        });
    }

    private async loadExercises(): Promise<void> {
        try {
            this.isLoading = true;
            
            // Simulated API call - replace with actual data fetching
            this._exercises = [
                {
                    id: '1',
                    title: 'Common Verbs Quiz',
                    description: 'Practice essential everyday verbs',
                    type: 'vocabulary',
                    difficulty: 'Easy',
                    points: 50,
                    icon: '📝'
                },
                {
                    id: '2',
                    title: 'Past Tense Practice',
                    description: 'Master regular and irregular verbs',
                    type: 'grammar',
                    difficulty: 'Medium',
                    points: 75,
                    icon: '⏰'
                },
                {
                    id: '3',
                    title: 'Word Stress',
                    description: 'Learn correct word emphasis',
                    type: 'pronunciation',
                    difficulty: 'Hard',
                    points: 100,
                    icon: '🗣️'
                }
            ];
            
            this.notifyPropertyChange('filteredExercises', this.filteredExercises);
        } catch (error) {
            console.error('Error loading exercises:', error);
        } finally {
            this.isLoading = false;
        }
    }
}