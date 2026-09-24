const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const memoryNews = [];

class NewsRepository {
  async createNews(newsData) {
    try {
      if (prisma) {
        const created = await prisma.newsEvent.create({
          data: {
            headline: newsData.headline,
            sentiment: newsData.sentiment,
            impactScore: Number(newsData.impactScore),
          },
        });
        memoryNews.unshift(created);
        return created;
      }
    } catch (error) {
      logger.warn(`Prisma error in createNews, using in-memory fallback: ${error.message}`);
    }

    const fallbackNews = {
      id: newsData.id || `news-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      headline: newsData.headline,
      sentiment: newsData.sentiment,
      impactScore: Number(newsData.impactScore),
      createdAt: new Date(),
    };
    memoryNews.unshift(fallbackNews);
    return fallbackNews;
  }

  async getNewsEvents(limit = 20) {
    try {
      if (prisma) {
        const events = await prisma.newsEvent.findMany({
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        });
        return events;
      }
    } catch (error) {
      logger.warn(`Prisma error in getNewsEvents, returning in-memory fallback: ${error.message}`);
    }

    return memoryNews.slice(0, limit);
  }

  async getLatestNews() {
    try {
      if (prisma) {
        const latest = await prisma.newsEvent.findFirst({
          orderBy: { createdAt: 'desc' },
        });
        if (latest) return latest;
      }
    } catch (error) {
      logger.warn(`Prisma error in getLatestNews: ${error.message}`);
    }

    return memoryNews.length > 0 ? memoryNews[0] : null;
  }
}

module.exports = new NewsRepository();
