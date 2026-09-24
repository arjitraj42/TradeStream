const MomentumTrader = require('./MomentumTrader');
const ValueTrader = require('./ValueTrader');
const BearTrader = require('./BearTrader');
const AggressiveTrader = require('./AggressiveTrader');
const MarketMakerTrader = require('./MarketMakerTrader');

const tradersMap = {
  MomentumTrader: new MomentumTrader(),
  ValueTrader: new ValueTrader(),
  BearTrader: new BearTrader(),
  AggressiveTrader: new AggressiveTrader(),
  MarketMakerTrader: new MarketMakerTrader(),
};

function getAllTraders() {
  return Object.values(tradersMap);
}

function getTraderByType(type) {
  return tradersMap[type] || null;
}

module.exports = {
  tradersMap,
  getAllTraders,
  getTraderByType,
};
