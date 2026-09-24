const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const orderRepository = require('../repositories/orderRepository');

class MatchingEngineService {
  async forwardOrder(order) {
    if (!config.MATCHING_ENGINE_URL) return false;

    try {
      const payload = {
        orderId: order.id,
        traderType: order.traderType,
        side: order.side,
        orderType: order.orderType,
        price: order.price,
        quantity: order.quantity,
        timestamp: order.timestamp,
      };

      const response = await axios.post(config.MATCHING_ENGINE_URL, payload, {
        timeout: 2000,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status >= 200 && response.status < 300) {
        logger.info(`Order ${order.id} successfully forwarded to Matching Engine`);
        await orderRepository.updateOrderForwardedStatus(order.id, true);
        return true;
      }
    } catch (error) {
      logger.debug(`Matching Engine unreachable at ${config.MATCHING_ENGINE_URL}: ${error.message}`);
    }

    return false;
  }

  async forwardOrdersBatch(orders) {
    if (!orders || orders.length === 0) return;
    const promises = orders.map(ord => this.forwardOrder(ord));
    await Promise.allSettled(promises);
  }
}

module.exports = new MatchingEngineService();
