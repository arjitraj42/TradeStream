const newsService = require('../services/newsService');
const { createNewsSchema } = require('../models/dtos');

class NewsController {
  async createNews(req, res, next) {
    try {
      const validatedData = createNewsSchema.parse(req.body);
      const newsEvent = await newsService.publishNews(validatedData);

      return res.status(201).json({
        success: true,
        message: 'News event published successfully',
        data: newsEvent,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNews(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const newsList = await newsService.getRecentNews(limit);

      return res.status(200).json({
        success: true,
        count: newsList.length,
        data: newsList,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NewsController();
