const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

try {
  // Initialize Firebase Admin with environment variables
  // In production, use proper service account credentials
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://demo-project.firebaseio.com'
  });

  logger.info('Firebase Admin initialized successfully');
} catch (error) {
  logger.error('Error initializing Firebase Admin:', error);
  throw error;
}

module.exports = admin;