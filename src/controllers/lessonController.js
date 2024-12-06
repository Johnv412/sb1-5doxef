const { logger } = require('../utils/logger');

const lessonController = {
  async getLessons(req, res) {
    try {
      // TODO: Implement get lessons
      res.status(200).json({
        status: 'success',
        data: [
          {
            id: 1,
            title: 'Basic Greetings',
            description: 'Learn common English greetings'
          }
        ]
      });
    } catch (error) {
      logger.error('Get lessons error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get lessons'
      });
    }
  },

  async getLesson(req, res) {
    try {
      const { id } = req.params;
      // TODO: Implement get single lesson
      res.status(200).json({
        status: 'success',
        data: {
          id,
          title: 'Basic Greetings',
          description: 'Learn common English greetings'
        }
      });
    } catch (error) {
      logger.error('Get lesson error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get lesson'
      });
    }
  }
};

module.exports = lessonController;