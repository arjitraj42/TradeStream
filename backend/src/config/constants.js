const TRADER_TYPES = {
  MOMENTUM: 'MomentumTrader',
  VALUE: 'ValueTrader',
  BEAR: 'BearTrader',
  AGGRESSIVE: 'AggressiveTrader',
  MARKET_MAKER: 'MarketMakerTrader',
};

const ORDER_SIDES = {
  BUY: 'BUY',
  SELL: 'SELL',
};

const ORDER_TYPES = {
  LIMIT: 'LIMIT',
  MARKET: 'MARKET',
};

const NEWS_SENTIMENTS = {
  POSITIVE: 'POSITIVE',
  NEGATIVE: 'NEGATIVE',
  NEUTRAL: 'NEUTRAL',
};

const SOCKET_EVENTS = {
  NEW_ORDER: 'new-order',
  MARKET_UPDATE: 'market-update',
  NEWS_EVENT: 'news-event',
  SIMULATION_STATUS: 'simulation-status',
};

module.exports = {
  TRADER_TYPES,
  ORDER_SIDES,
  ORDER_TYPES,
  NEWS_SENTIMENTS,
  SOCKET_EVENTS,
};
