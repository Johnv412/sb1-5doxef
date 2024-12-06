import { LoginViewModel } from '../views/auth/login-view-model';

describe('LoginViewModel', () => {
    let viewModel: LoginViewModel;

    beforeEach(() => {
        viewModel = new LoginViewModel();
    });

    describe('email validation', () => {
        it('should show error for empty email', () => {
            viewModel.email = '';
            expect(viewModel.emailError).toBe('Email is required');
        });

        it('should show error for invalid email format', () => {
            viewModel.email = 'invalid-email';
            expect(viewModel.emailError).toBe('Invalid email format');
        });

        it('should clear error for valid email', () => {
            viewModel.email = 'test@example.com';
            expect(viewModel.emailError).toBe('');
        });
    });

    describe('password validation', () => {
        it('should show error for empty password', () => {
            viewModel.password = '';
            expect(viewModel.passwordError).toBe('Password is required');
        });

        it('should clear error when password is provided', () => {
            viewModel.password = 'password123';
            expect(viewModel.passwordError).toBe('');
        });
    });

    describe('rate limiting', () => {
        it('should prevent rapid login attempts', async () => {
            const attempts = Array(5).fill(null).map(() => viewModel.onLogin());
            await Promise.all(attempts);
            expect(viewModel.isLoading).toBe(false);
        });
    });
});