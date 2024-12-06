import { APP_CONSTANTS } from './constants';
import { logger } from './logger';

export interface RetryOptions {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
}

export async function retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = APP_CONSTANTS.LIMITS.MAX_RETRY_ATTEMPTS,
        delay = 1000,
        backoff = true
    } = options;

    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxAttempts) {
                logger.error(`[Retry] All ${maxAttempts} attempts failed:`, error);
                break;
            }

            const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
            logger.warn(`[Retry] Attempt ${attempt} failed, retrying in ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw lastError!;
}