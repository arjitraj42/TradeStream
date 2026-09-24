const BaseTrader = require('./BaseTrader');
const { TRADER_TYPES, ORDER_SIDES, ORDER_TYPES } = require('../config/constants');
const { roundTo } = require('../utils/mathUtils');

class ValueTrader extends BaseTrader {
  constructor() {
    super(TRADER_TYPES.VALUE, 'Value Trader');
  }

  generateOrder(context, config = {}) {
    if (config.enabled === false) return [];

    const { currentPrice, fairValue } = context;
    if (!fairValue || fairValue <= 0) return [];

    let premiumMultiplier = 1.2;
    if (config.customSettings) {
      try {
        const custom = typeof config.customSettings === 'string'
          ? JSON.parse(config.customSettings)
          : config.customSettings;
        if (custom.premiumMultiplier) premiumMultiplier = Number(custom.premiumMultiplier);
      } catch (e) {}
    }

    const confidence = config.confidenceScore || 0.90;
    const orders = [];

    if (currentPrice < fairValue) {
      const quantity = this.determineQuantity(context, config);
      const bidPrice = roundTo(currentPrice, 2);
      const discountPercent = (((fairValue - currentPrice) / fairValue) * 100).toFixed(2);

      orders.push(
        this.createOrderObject({
          side: ORDER_SIDES.BUY,
          orderType: ORDER_TYPES.LIMIT,
          price: bidPrice,
          quantity,
          confidence,
          reason: `Value BUY: Undervalued by ${discountPercent}% (Current: \$${currentPrice} vs Fair: \$${fairValue})`,
        })
      );
    } else if (currentPrice > fairValue * premiumMultiplier) {
      const quantity = this.determineQuantity(context, config);
      const askPrice = roundTo(currentPrice, 2);
      const overvaluePercent = (((currentPrice - fairValue) / fairValue) * 100).toFixed(2);

      orders.push(
        this.createOrderObject({
          side: ORDER_SIDES.SELL,
          orderType: ORDER_TYPES.LIMIT,
          price: askPrice,
          quantity,
          confidence,
          reason: `Value SELL: Overvalued by ${overvaluePercent}% (Current: \$${currentPrice} vs Fair Threshold: \$${roundTo(fairValue * premiumMultiplier, 2)})`,
        })
      );
    }

    return orders;
  }
}

module.exports = ValueTrader;
