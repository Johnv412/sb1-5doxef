import { AuthService } from '../services/auth-service';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = AuthService.getInstance();
    });

    describe('login', () => {
        it('should throw error for empty email', async () => {
            await expect(authService.login('', 'password123'))
                .rejects
                .toThrow('Email and password are required');
        });

        it('should throw error for empty password', async () => {
            await expect(authService.login('test@email.com', ''))
                .rejects
                .toThrow('Email and password are required');
        });
    });

    describe('register', () => {
        it('should throw error for invalid email format', async () => {
            await expect(authService.register('invalid-email', 'password123'))
                .rejects
                .toThrow('Invalid email address');
        });

        it('should throw error for weak password', async () => {
            await expect(authService.register('test@email.com', '123'))
                .rejects
                .toThrow('Password is too weak');
        });
    });
});