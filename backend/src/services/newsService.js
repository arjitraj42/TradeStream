const newsRepository = require('../repositories/newsRepository');
const marketContextService = require('./marketContextService');
const socketManager = require('../sockets/socketManager');
const logger = require('../utils/logger');

class NewsService {
  async publishNews({ headline, sentiment = 'NEUTRAL', impactScore = 5 }) {
    const newsEvent = await newsRepository.createNews({
      headline,
      sentiment: sentiment.toUpperCase(),
      impactScore: Math.min(10, Math.max(1, Number(impactScore))),
    });

    marketContextService.setNewsEvent(newsEvent);
    socketManager.broadcastNewsEvent(newsEvent);
    socketManager.broadcastMarketUpdate(marketContextService.getContext());

    logger.info(`Published News Event: "${newsEvent.headline}" [${newsEvent.sentiment}, Impact: ${newsEvent.impactScore}]`);

    return newsEvent;
  }

  async getRecentNews(limit = 20) {
    return await newsRepository.getNewsEvents(limit);
  }
}

module.exports = new NewsService();
