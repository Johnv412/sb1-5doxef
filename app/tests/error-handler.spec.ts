import { ErrorHandler } from '../utils/error-handler';

describe('ErrorHandler', () => {
    describe('getUserFriendlyMessage', () => {
        it('should handle auth errors', () => {
            const error = { code: 'auth/user-not-found' };
            expect(ErrorHandler.getUserFriendlyMessage(error))
                .toBe('Invalid email or password');
        });

        it('should handle network errors', () => {
            const error = { message: 'network error occurred' };
            expect(ErrorHandler.getUserFriendlyMessage(error))
                .toContain('internet connection');
        });

        it('should handle null error', () => {
            expect(ErrorHandler.getUserFriendlyMessage(null))
                .toBe('An unexpected error occurred');
        });
    });
});