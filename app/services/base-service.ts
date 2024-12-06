import { firebase } from '@nativescript/firebase-core';
import { getDatabase, Database } from '@nativescript/firebase-database';
import { ErrorHandler } from '../utils/error-handler';

export abstract class BaseService {
    protected database: Database;
    
    constructor() {
        try {
            this.database = getDatabase();
        } catch (error) {
            ErrorHandler.handleError(error, 'BaseService.constructor');
            throw new Error('Failed to initialize database connection');
        }
    }

    protected handleError(error: any, context: string): never {
        ErrorHandler.handleError(error, context);
        throw error;
    }
}