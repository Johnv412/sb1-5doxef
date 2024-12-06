import { Observable, Frame, alert } from '@nativescript/core';
import { AuthService } from '../../services/auth-service';
import { Validators } from '../../utils/validators';

export class LoginViewModel extends Observable {
    private authService: AuthService;
    private _email: string = '';
    private _password: string = '';
    private _errorMessage: string = '';
    private _isLoading: boolean = false;
    private _emailError: string = '';
    private _passwordError: string = '';
    private _lastAttempt: number = 0;
    private _attemptCount: number = 0;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value?.trim() || '';
            this.validateEmail();
            this.notifyPropertyChange('email', this._email);
            this.notifyPropertyChange('emailError', this._emailError);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value || '';
            this.validatePassword();
            this.notifyPropertyChange('password', this._password);
            this.notifyPropertyChange('passwordError', this._passwordError);
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

    get isLoading(): boolean {
        return this._isLoading;
    }

    set isLoading(value: boolean) {
        if (this._isLoading !== value) {
            this._isLoading = value;
            this.notifyPropertyChange('isLoading', value);
        }
    }

    get emailError(): string {
        return this._emailError;
    }

    get passwordError(): string {
        return this._passwordError;
    }

    private validateEmail(): boolean {
        if (!this._email) {
            this._emailError = 'Email is required';
            return false;
        }
        if (!Validators.isValidEmail(this._email)) {
            this._emailError = 'Invalid email format';
            return false;
        }
        this._emailError = '';
        return true;
    }

    private validatePassword(): boolean {
        if (!this._password) {
            this._passwordError = 'Password is required';
            return false;
        }
        this._passwordError = '';
        return true;
    }

    private validateForm(): boolean {
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        return isEmailValid && isPasswordValid;
    }

    private async showRateLimitAlert(): Promise<void> {
        await alert({
            title: "Too Many Attempts",
            message: "Please wait a moment before trying again",
            okButtonText: "OK"
        });
    }

    private checkRateLimit(): boolean {
        const now = Date.now();
        if (now - this._lastAttempt < 2000) {
            this._attemptCount++;
            if (this._attemptCount > 3) {
                this.showRateLimitAlert();
                return false;
            }
        } else {
            this._attemptCount = 0;
        }
        this._lastAttempt = now;
        return true;
    }

    async onLogin() {
        if (this.isLoading) return;
        if (!this.checkRateLimit()) return;

        try {
            this.errorMessage = '';
            
            if (!this.validateForm()) {
                console.log('[LoginViewModel] Form validation failed');
                return;
            }

            this.isLoading = true;
            console.log('[LoginViewModel] Attempting login...');

            await this.authService.login(this.email, this.password);
            
            const topmost = Frame.topmost();
            if (topmost) {
                topmost.navigate({
                    moduleName: "views/main/home",
                    clearHistory: true
                });
                console.log('[LoginViewModel] Navigation successful');
            } else {
                throw new Error('Navigation failed: Frame not available');
            }
        } catch (error: any) {
            this.errorMessage = error.message;
            console.error('[LoginViewModel] Login error:', error);
            
            if (error.message.includes('wrong-password')) {
                this._passwordError = 'Incorrect password';
                this.notifyPropertyChange('passwordError', this._passwordError);
            }
        } finally {
            this.isLoading = false;
        }
    }

    onRegister() {
        const topmost = Frame.topmost();
        if (topmost) {
            topmost.navigate({
                moduleName: "views/auth/register",
                clearHistory: false
            });
        } else {
            console.error('[LoginViewModel] Navigation failed: Frame.topmost() is null');
        }
    }

    onForgotPassword() {
        if (!this._email) {
            this._emailError = 'Please enter your email first';
            this.notifyPropertyChange('emailError', this._emailError);
            return;
        }

        if (!Validators.isValidEmail(this._email)) {
            this._emailError = 'Please enter a valid email';
            this.notifyPropertyChange('emailError', this._emailError);
            return;
        }

        // Implement password reset logic
        alert({
            title: "Reset Password",
            message: "Password reset instructions will be sent to your email",
            okButtonText: "OK"
        });
    }
}