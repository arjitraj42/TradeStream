const BaseTrader = require('./BaseTrader');
const { TRADER_TYPES, ORDER_SIDES, ORDER_TYPES } = require('../config/constants');
const { roundTo } = require('../utils/mathUtils');

class AggressiveTrader extends BaseTrader {
  constructor() {
    super(TRADER_TYPES.AGGRESSIVE, 'Aggressive Trader');
  }

  generateOrder(context, config = {}) {
    if (config.enabled === false) return [];

    const { currentPrice, latestNews } = context;
    let newsThreshold = 7;

    if (config.customSettings) {
      try {
        const custom = typeof config.customSettings === 'string'
          ? JSON.parse(config.customSettings)
          : config.customSettings;
        if (custom.newsImpactThreshold) newsThreshold = Number(custom.newsImpactThreshold);
      } catch (e) {}
    }

    const confidence = config.confidenceScore || 0.95;
    const orders = [];

    if (latestNews) {
      const activeImpact = latestNews.decayedImpactScore !== undefined
        ? latestNews.decayedImpactScore
        : latestNews.impactScore || 5;

      if (activeImpact >= newsThreshold) {
        const quantity = this.determineQuantity(context, config, true);

        if (latestNews.sentiment === 'POSITIVE') {
          orders.push(
            this.createOrderObject({
              side: ORDER_SIDES.BUY,
              orderType: ORDER_TYPES.MARKET,
              price: currentPrice,
              quantity,
              confidence,
              reason: `Aggressive MARKET BUY: High impact positive news "${latestNews.headline}" (Impact: ${activeImpact})`,
            })
          );
        } else if (latestNews.sentiment === 'NEGATIVE') {
          orders.push(
            this.createOrderObject({
              side: ORDER_SIDES.SELL,
              orderType: ORDER_TYPES.MARKET,
              price: currentPrice,
              quantity,
              confidence,
              reason: `Aggressive MARKET SELL: High impact negative news "${latestNews.headline}" (Impact: ${activeImpact})`,
            })
          );
        }
      }
    }

    if (orders.length === 0 && context.volatility > 0.05) {
      const quantity = Math.round((config.maxQuantity || 500) * 0.8);
      const side = Math.random() > 0.5 ? ORDER_SIDES.BUY : ORDER_SIDES.SELL;

      orders.push(
        this.createOrderObject({
          side,
          orderType: ORDER_TYPES.MARKET,
          price: currentPrice,
          quantity,
          confidence: roundTo(confidence * 0.9, 2),
          reason: `Aggressive Volatility Sweep ${side}: Volatility spike at ${(context.volatility * 100).toFixed(1)}%`,
        })
      );
    }

    return orders;
  }
}

module.exports = AggressiveTrader;
