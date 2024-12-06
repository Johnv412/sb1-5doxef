import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';
import { AuthService } from '../../services/auth-service';

export class RegisterViewModel extends Observable {
    private authService: AuthService;
    private _email: string = '';
    private _password: string = '';
    private _confirmPassword: string = '';
    private _errorMessage: string = '';

    constructor() {
        super();
        this.authService = new AuthService();
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    get confirmPassword(): string {
        return this._confirmPassword;
    }

    set confirmPassword(value: string) {
        if (this._confirmPassword !== value) {
            this._confirmPassword = value;
            this.notifyPropertyChange('confirmPassword', value);
        }
    }

    get errorMessage(): string {
        return this._errorMessage;
    }

    set errorMessage(value: string) {
        if (this._errorMessage !== value) {
            this._errorMessage = value;
            this.notifyPropertyChange('errorMessage', value);
        }
    }

    async onRegister() {
        try {
            this.errorMessage = '';
            
            if (this.password !== this.confirmPassword) {
                this.errorMessage = 'Passwords do not match';
                return;
            }

            await this.authService.register(this.email, this.password);
            Frame.topmost().navigate({
                moduleName: "views/onboarding/proficiency-test",
                clearHistory: true
            });
        } catch (error) {
            this.errorMessage = error.message;
        }
    }

    onBackToLogin() {
        Frame.topmost().goBack();
    }
}