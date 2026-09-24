const { v4: uuidv4 } = require('crypto');
const { calculatePositionSize, roundTo } = require('../utils/mathUtils');
const { ORDER_SIDES, ORDER_TYPES } = require('../config/constants');

class BaseTrader {
  constructor(traderType, displayName) {
    this.traderType = traderType;
    this.displayName = displayName;
  }

  generateOrder(context, config = {}) {
    throw new Error(`generateOrder() must be implemented by subclass ${this.traderType}`);
  }

  createOrderObject({
    side,
    orderType = ORDER_TYPES.LIMIT,
    price,
    quantity,
    confidence = 0.8,
    reason = '',
  }) {
    return {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      traderType: this.traderType,
      side,
      orderType,
      price: roundTo(Number(price), 2),
      quantity: Math.max(1, Math.round(Number(quantity))),
      confidence: roundTo(Number(confidence), 2),
      reason,
      forwarded: false,
      timestamp: new Date(),
    };
  }

  determineQuantity(context, config, isAggressive = false) {
    const minQty = config.minQuantity || 10;
    const maxQty = config.maxQuantity || 500;
    const volatility = context.volatility || 0.03;
    const riskAppetite = config.riskAppetite !== undefined ? config.riskAppetite : 0.5;
    const confidence = config.confidenceScore !== undefined ? config.confidenceScore : 0.8;

    return calculatePositionSize({
      minQuantity: minQty,
      maxQuantity: maxQty,
      volatility,
      riskAppetite,
      confidence,
      aggressive: isAggressive,
    });
  }
}

module.exports = BaseTrader;
