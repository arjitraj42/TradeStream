const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trader_simulation?schema=public',
  MATCHING_ENGINE_URL: process.env.MATCHING_ENGINE_URL || 'http://localhost:4000/api/matching-engine/orders',
  SIMULATION_CRON_SCHEDULE: process.env.SIMULATION_CRON_SCHEDULE || '*/7 * * * * *',
  INITIAL_PRICE: parseFloat(process.env.INITIAL_PRICE || '100.00'),
  INITIAL_FAIR_VALUE: parseFloat(process.env.INITIAL_FAIR_VALUE || '100.00'),
  INITIAL_VOLATILITY: parseFloat(process.env.INITIAL_VOLATILITY || '0.03'),
  AUTO_SIMULATE_PRICE_MOVEMENT: process.env.AUTO_SIMULATE_PRICE_MOVEMENT === 'true',
};
