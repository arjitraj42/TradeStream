const config = require('../config/env');
const logger = require('../utils/logger');
const { roundTo, getRandomNumber, calculateDecayedNewsImpact } = require('../utils/mathUtils');
const newsRepository = require('../repositories/newsRepository');

class MarketContextService {
  constructor() {
    this.currentPrice = config.INITIAL_PRICE;
    this.previousPrice = config.INITIAL_PRICE;
    this.fairValue = config.INITIAL_FAIR_VALUE;
    this.volatility = config.INITIAL_VOLATILITY;
    this.latestNews = null;
    this.timestamp = new Date();
  }

  async init() {
    try {
      const latest = await newsRepository.getLatestNews();
      if (latest) {
        this.latestNews = latest;
      }
    } catch (err) {
      logger.warn(`Could not load latest news during MarketContext init: ${err.message}`);
    }
  }

  getContext() {
    let decayedNews = null;
    if (this.latestNews) {
      const createdAt = new Date(this.latestNews.createdAt).getTime();
      const now = Date.now();
      const elapsedSeconds = Math.max(0, (now - createdAt) / 1000);
      const decayedImpact = calculateDecayedNewsImpact(
        this.latestNews.impactScore,
        elapsedSeconds
      );

      decayedNews = {
        ...this.latestNews,
        decayedImpactScore: decayedImpact,
        elapsedSeconds: Math.floor(elapsedSeconds),
      };
    }

    return {
      currentPrice: roundTo(this.currentPrice, 2),
      previousPrice: roundTo(this.previousPrice, 2),
      fairValue: roundTo(this.fairValue, 2),
      volatility: roundTo(this.volatility, 4),
      latestNews: decayedNews,
      timestamp: this.timestamp,
      priceChange: roundTo(this.currentPrice - this.previousPrice, 2),
      priceChangePercent: this.previousPrice > 0
        ? roundTo(((this.currentPrice - this.previousPrice) / this.previousPrice) * 100, 2)
        : 0,
    };
  }

  setNewsEvent(newsEvent) {
    this.latestNews = newsEvent;
    this.timestamp = new Date();

    if (newsEvent) {
      const impactScore = newsEvent.impactScore || 5;
      const impactRatio = impactScore / 10;

      if (newsEvent.sentiment === 'POSITIVE') {
        this.fairValue = roundTo(this.fairValue * (1 + 0.02 * impactRatio), 2);
      } else if (newsEvent.sentiment === 'NEGATIVE') {
        this.fairValue = roundTo(this.fairValue * (1 - 0.02 * impactRatio), 2);
      }

      this.volatility = Math.min(0.15, roundTo(this.volatility + 0.005 * impactRatio, 4));
    }
  }

  updateContext({ currentPrice, fairValue, volatility }) {
    if (currentPrice !== undefined) {
      this.previousPrice = this.currentPrice;
      this.currentPrice = roundTo(Number(currentPrice), 2);
    }
    if (fairValue !== undefined) {
      this.fairValue = roundTo(Number(fairValue), 2);
    }
    if (volatility !== undefined) {
      this.volatility = roundTo(Number(volatility), 4);
    }
    this.timestamp = new Date();
    return this.getContext();
  }

  simulateTick() {
    this.previousPrice = this.currentPrice;

    const fairValueDiff = (this.fairValue - this.currentPrice) / this.currentPrice;
    const meanReversionPull = fairValueDiff * 0.05;

    let newsNudge = 0;
    if (this.latestNews) {
      const createdAt = new Date(this.latestNews.createdAt).getTime();
      const elapsedSeconds = (Date.now() - createdAt) / 1000;
      const activeImpact = calculateDecayedNewsImpact(this.latestNews.impactScore, elapsedSeconds);

      if (activeImpact > 0.5) {
        const magnitude = (activeImpact / 10) * 0.008;
        if (this.latestNews.sentiment === 'POSITIVE') newsNudge = magnitude;
        else if (this.latestNews.sentiment === 'NEGATIVE') newsNudge = -magnitude;
      }
    }

    const randomNoise = (Math.random() - 0.5) * 2 * this.volatility;
    const changePercent = meanReversionPull + newsNudge + randomNoise;
    let newPrice = this.currentPrice * (1 + changePercent);

    newPrice = Math.max(1.0, roundTo(newPrice, 2));

    this.currentPrice = newPrice;
    this.timestamp = new Date();

    if (this.volatility > 0.03) {
      this.volatility = roundTo(Math.max(0.02, this.volatility - 0.0005), 4);
    }

    return this.getContext();
  }
}

module.exports = new MarketContextService();
