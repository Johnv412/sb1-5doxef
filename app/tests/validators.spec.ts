import { Validators } from '../utils/validators';

describe('Validators', () => {
    describe('isValidEmail', () => {
        it('should return true for valid email', () => {
            expect(Validators.isValidEmail('test@example.com')).toBe(true);
        });

        it('should return false for invalid email', () => {
            expect(Validators.isValidEmail('invalid-email')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(Validators.isValidEmail('')).toBe(false);
        });
    });

    describe('isStrongPassword', () => {
        it('should return true for strong password', () => {
            expect(Validators.isStrongPassword('Test1234')).toBe(true);
        });

        it('should return false for weak password', () => {
            expect(Validators.isStrongPassword('weak')).toBe(false);
        });
    });

    describe('getPasswordStrength', () => {
        it('should return correct score for strong password', () => {
            const result = Validators.getPasswordStrength('Test1234!');
            expect(result.score).toBe(5);
            expect(result.isValid).toBe(true);
        });

        it('should return correct score for weak password', () => {
            const result = Validators.getPasswordStrength('weak');
            expect(result.score).toBe(1);
            expect(result.isValid).toBe(false);
        });
    });
});