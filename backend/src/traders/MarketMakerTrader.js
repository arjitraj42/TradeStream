const BaseTrader = require('./BaseTrader');
const { TRADER_TYPES, ORDER_SIDES, ORDER_TYPES } = require('../config/constants');
const { roundTo } = require('../utils/mathUtils');

class MarketMakerTrader extends BaseTrader {
  constructor() {
    super(TRADER_TYPES.MARKET_MAKER, 'Market Maker Trader');
    this.lastSide = ORDER_SIDES.SELL;
  }

  generateOrder(context, config = {}) {
    if (config.enabled === false) return [];

    const { currentPrice, volatility } = context;
    if (!currentPrice || currentPrice <= 0) return [];

    let spreadPercent = 0.5;
    if (config.customSettings) {
      try {
        const custom = typeof config.customSettings === 'string'
          ? JSON.parse(config.customSettings)
          : config.customSettings;
        if (custom.spreadPercent) spreadPercent = Number(custom.spreadPercent);
      } catch (e) {}
    }

    const effectiveSpread = Math.max(0.2, spreadPercent + volatility * 10);
    const halfSpreadDecimal = effectiveSpread / 100;

    const quantity = this.determineQuantity(context, config);
    const confidence = config.confidenceScore || 0.99;

    const sideToPlace = this.lastSide === ORDER_SIDES.BUY ? ORDER_SIDES.SELL : ORDER_SIDES.BUY;
    this.lastSide = sideToPlace;

    if (sideToPlace === ORDER_SIDES.BUY) {
      const bidPrice = roundTo(currentPrice * (1 - halfSpreadDecimal), 2);
      return [
        this.createOrderObject({
          side: ORDER_SIDES.BUY,
          orderType: ORDER_TYPES.LIMIT,
          price: bidPrice,
          quantity,
          confidence,
          reason: `Market Maker BID liquidity at \$${bidPrice} (-${effectiveSpread.toFixed(2)}% spread)`,
        }),
      ];
    } else {
      const askPrice = roundTo(currentPrice * (1 + halfSpreadDecimal), 2);
      return [
        this.createOrderObject({
          side: ORDER_SIDES.SELL,
          orderType: ORDER_TYPES.LIMIT,
          price: askPrice,
          quantity,
          confidence,
          reason: `Market Maker ASK liquidity at \$${askPrice} (+${effectiveSpread.toFixed(2)}% spread)`,
        }),
      ];
    }
  }
}

module.exports = MarketMakerTrader;
