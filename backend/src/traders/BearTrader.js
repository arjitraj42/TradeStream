const BaseTrader = require('./BaseTrader');
const { TRADER_TYPES, ORDER_SIDES, ORDER_TYPES } = require('../config/constants');
const { roundTo } = require('../utils/mathUtils');

class BearTrader extends BaseTrader {
  constructor() {
    super(TRADER_TYPES.BEAR, 'Bear Trader');
  }

  generateOrder(context, config = {}) {
    if (config.enabled === false) return [];

    const { currentPrice, latestNews } = context;
    if (!latestNews) return [];

    const activeImpact = latestNews.decayedImpactScore !== undefined
      ? latestNews.decayedImpactScore
      : latestNews.impactScore || 5;

    if (activeImpact < 1.0) return [];

    const confidence = config.confidenceScore || 0.80;
    const orders = [];

    if (latestNews.sentiment === 'NEGATIVE') {
      const quantity = this.determineQuantity(context, config, true);
      const sellPrice = roundTo(currentPrice * 0.995, 2);

      orders.push(
        this.createOrderObject({
          side: ORDER_SIDES.SELL,
          orderType: ORDER_TYPES.LIMIT,
          price: sellPrice,
          quantity,
          confidence,
          reason: `Bear SELL: Negative news "${latestNews.headline}" (Impact: ${activeImpact}/10)`,
        })
      );
    } else if (latestNews.sentiment === 'POSITIVE') {
      const minQty = config.minQuantity || 10;
      const smallQty = Math.max(5, Math.floor(minQty * 0.5));
      const buyPrice = roundTo(currentPrice, 2);

      orders.push(
        this.createOrderObject({
          side: ORDER_SIDES.BUY,
          orderType: ORDER_TYPES.LIMIT,
          price: buyPrice,
          quantity: smallQty,
          confidence: roundTo(confidence * 0.6, 2),
          reason: `Bear Conservative BUY: Positive news "${latestNews.headline}" (Cautious small qty: ${smallQty})`,
        })
      );
    }

    return orders;
  }
}

module.exports = BearTrader;
