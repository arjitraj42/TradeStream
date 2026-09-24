const BaseTrader = require('./BaseTrader');
const { TRADER_TYPES, ORDER_SIDES, ORDER_TYPES } = require('../config/constants');
const { roundTo } = require('../utils/mathUtils');

class MomentumTrader extends BaseTrader {
  constructor() {
    super(TRADER_TYPES.MOMENTUM, 'Momentum Trader');
  }

  generateOrder(context, config = {}) {
    if (config.enabled === false) return [];

    const { currentPrice, previousPrice } = context;
    if (!previousPrice || previousPrice <= 0) return [];

    const priceChangeRatio = (currentPrice - previousPrice) / previousPrice;
    const priceChangePercent = priceChangeRatio * 100;

    let thresholdPercent = 2.0;
    if (config.customSettings) {
      try {
        const custom = typeof config.customSettings === 'string'
          ? JSON.parse(config.customSettings)
          : config.customSettings;
        if (custom.thresholdPercent) thresholdPercent = Number(custom.thresholdPercent);
      } catch (e) {}
    }

    const confidence = config.confidenceScore || 0.85;
    const orders = [];

    if (priceChangePercent > thresholdPercent) {
      const quantity = this.determineQuantity(context, config);
      const buyPrice = roundTo(currentPrice * 1.002, 2);

      orders.push(
        this.createOrderObject({
          side: ORDER_SIDES.BUY,
          orderType: ORDER_TYPES.LIMIT,
          price: buyPrice,
          quantity,
          confidence,
          reason: `Momentum BUY triggered: price surged +${priceChangePercent.toFixed(2)}% (threshold: +${thresholdPercent}%)`,
        })
      );
    } else if (priceChangePercent < -thresholdPercent) {
      const quantity = this.determineQuantity(context, config);
      const sellPrice = roundTo(currentPrice * 0.998, 2);

      orders.push(
        this.createOrderObject({
          side: ORDER_SIDES.SELL,
          orderType: ORDER_TYPES.LIMIT,
          price: sellPrice,
          quantity,
          confidence,
          reason: `Momentum SELL triggered: price dropped ${priceChangePercent.toFixed(2)}% (threshold: -${thresholdPercent}%)`,
        })
      );
    }

    return orders;
  }
}

module.exports = MomentumTrader;
