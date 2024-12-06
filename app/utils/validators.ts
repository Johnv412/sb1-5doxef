export class Validators {
    static isValidEmail(email: string): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password: string): boolean {
        if (!password) return false;
        return password.length >= 6;
    }

    static getPasswordStrength(password: string): { score: number; feedback: string; isValid: boolean } {
        if (!password) {
            return { score: 0, feedback: 'Password is required', isValid: false };
        }

        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 10) score++;
        if (password.length < 6) {
            feedback.push('Password should be at least 6 characters long');
        }

        // Character variety checks
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Include uppercase letters');
        
        if (/[a-z]/.test(password)) score++;
        else feedback.push('Include lowercase letters');
        
        if (/[0-9]/.test(password)) score++;
        else feedback.push('Include numbers');
        
        if (/[^A-Za-z0-9]/.test(password)) score++;
        else feedback.push('Include special characters');

        return {
            score,
            feedback: feedback.join(', ') || 'Password is strong',
            isValid: score >= 3
        };
    }

    static validateForm(data: { [key: string]: any }): { 
        isValid: boolean; 
        errors: { [key: string]: string } 
    } {
        const errors: { [key: string]: string } = {};

        Object.entries(data).forEach(([key, value]) => {
            if (!value || (typeof value === 'string' && !value.trim())) {
                errors[key] = `${key} is required`;
            }
        });

        if (data.email && !this.isValidEmail(data.email)) {
            errors.email = 'Invalid email format';
        }

        if (data.password) {
            const passwordCheck = this.getPasswordStrength(data.password);
            if (!passwordCheck.isValid) {
                errors.password = passwordCheck.feedback;
            }
        }

        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}