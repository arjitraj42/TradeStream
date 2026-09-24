const marketContextService = require('./marketContextService');
const traderConfigRepository = require('../repositories/traderConfigRepository');
const orderRepository = require('../repositories/orderRepository');
const { getAllTraders } = require('../traders');
const socketManager = require('../sockets/socketManager');
const matchingEngineService = require('./matchingEngineService');
const logger = require('../utils/logger');

class OrderExecutionService {
  async executeSimulationCycle() {
    const context = marketContextService.getContext();

    const configs = await traderConfigRepository.getAllConfigs();
    const configMap = new Map(configs.map(c => [c.traderType, c]));

    const traders = getAllTraders();
    const generatedOrders = [];

    for (const trader of traders) {
      const config = configMap.get(trader.traderType) || {};
      if (config.enabled === false) continue;

      try {
        const orders = trader.generateOrder(context, config);
        if (orders && orders.length > 0) {
          generatedOrders.push(...orders);
        }
      } catch (err) {
        logger.error(`Error generating orders for ${trader.traderType}: ${err.message}`);
      }
    }

    if (generatedOrders.length === 0) {
      return { context, orders: [] };
    }

    const savedOrders = await orderRepository.createManyOrders(generatedOrders);

    for (const order of savedOrders) {
      socketManager.broadcastNewOrder(order);
    }

    logger.info(`Simulation cycle generated ${savedOrders.length} orders across ${traders.length} traders`);

    matchingEngineService.forwardOrdersBatch(savedOrders).catch(err => {
      logger.debug(`Background matching engine forward error: ${err.message}`);
    });

    return {
      context,
      orders: savedOrders,
    };
  }

  async getOrders(filters) {
    return await orderRepository.getOrders(filters);
  }
}

module.exports = new OrderExecutionService();
