import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';

export class ProficiencyTestViewModel extends Observable {
    private _questions: any[];
    private _currentQuestionIndex: number;
    private _answers: string[];

    constructor() {
        super();
        this._currentQuestionIndex = 0;
        this._answers = [];
        this._questions = [
            {
                question: "How comfortable are you with English?",
                options: ["Complete Beginner", "Some Basic Knowledge", "Intermediate", "Advanced"]
            },
            {
                question: "What's your main goal?",
                options: ["Basic Conversations", "Business English", "Academic English", "Travel & Culture"]
            },
            {
                question: "How much time can you dedicate daily?",
                options: ["5-10 minutes", "15-30 minutes", "1 hour", "More than 1 hour"]
            }
        ];
        this.notifyPropertyChange('currentQuestion', this.currentQuestion);
        this.notifyPropertyChange('progressWidth', this.progressWidth);
    }

    get currentQuestion() {
        return this._questions[this._currentQuestionIndex];
    }

    get progressWidth() {
        return `${((this._currentQuestionIndex + 1) / this._questions.length) * 100}%`;
    }

    onAnswerSelected(args) {
        const answer = args.object.text;
        this._answers.push(answer);

        if (this._currentQuestionIndex < this._questions.length - 1) {
            this._currentQuestionIndex++;
            this.notifyPropertyChange('currentQuestion', this.currentQuestion);
            this.notifyPropertyChange('progressWidth', this.progressWidth);
        } else {
            this.completeOnboarding();
        }
    }

    private completeOnboarding() {
        Frame.topmost().navigate({
            moduleName: "views/main/home",
            clearHistory: true
        });
    }
}