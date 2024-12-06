const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const lessonController = require('../controllers/lessonController');

// User routes
router.post('/users/register', userController.register);
router.post('/users/login', userController.login);
router.get('/users/profile', userController.getProfile);

// Lesson routes
router.get('/lessons', lessonController.getLessons);
router.get('/lessons/:id', lessonController.getLesson);

module.exports = router;