export const APP_CONSTANTS = {
    ERRORS: {
        GENERAL: 'An unexpected error occurred. Please try again.',
        NETWORK: 'Please check your internet connection and try again.',
        TIMEOUT: 'The request timed out. Please try again.',
        AUTH: {
            INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
            WEAK_PASSWORD: 'Password must be at least 6 characters long.',
            EMAIL_IN_USE: 'This email is already registered.',
            INVALID_EMAIL: 'Please enter a valid email address.',
            OPERATION_NOT_ALLOWED: 'This operation is not allowed.',
            USER_DISABLED: 'This account has been disabled.',
            GENERAL: 'Authentication error occurred. Please try again.'
        },
        VALIDATION: {
            REQUIRED_FIELD: 'This field is required.',
            INVALID_FORMAT: 'Invalid format.',
            PASSWORD_MISMATCH: 'Passwords do not match.'
        }
    },
    TIMEOUTS: {
        FIREBASE_INIT: 10000, // 10 seconds
        API_REQUEST: 30000,   // 30 seconds
        CACHE_DURATION: 3600000 // 1 hour
    },
    CACHE_KEYS: {
        USER_PREFERENCES: 'user_preferences',
        LESSON_PROGRESS: 'lesson_progress',
        OFFLINE_LESSONS: 'offline_lessons'
    },
    LIMITS: {
        MAX_RETRY_ATTEMPTS: 3,
        MIN_PASSWORD_LENGTH: 6,
        MAX_CACHE_SIZE: 50 * 1024 * 1024 // 50MB
    }
};