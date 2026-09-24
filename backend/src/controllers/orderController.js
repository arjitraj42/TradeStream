const orderExecutionService = require('../services/orderExecutionService');
const orderRepository = require('../repositories/orderRepository');
const socketManager = require('../sockets/socketManager');
const matchingEngineService = require('../services/matchingEngineService');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { side, orderType = 'LIMIT', price, quantity, symbol = 'AAPL', companyName = 'Apple Inc.', traderType = 'UserTrader' } = req.body;

      const upperSide = (side || '').toUpperCase();
      const upperType = (orderType || 'LIMIT').toUpperCase();

      if (!['BUY', 'SELL'].includes(upperSide)) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Side must be BUY or SELL',
        });
      }

      const numQty = Number(quantity);
      if (isNaN(numQty) || numQty <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Quantity must be greater than 0',
        });
      }

      const numPrice = Number(price);
      if (upperType === 'LIMIT' && (isNaN(numPrice) || numPrice <= 0)) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Price must be greater than 0 for LIMIT orders',
        });
      }

      const orderData = {
        id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        traderType,
        side: upperSide,
        orderType: upperType,
        price: numPrice,
        quantity: numQty,
        confidence: 1.0,
        reason: `Manual ${upperSide} order for ${symbol} placed via Trading Console`,
        forwarded: false,
        timestamp: new Date(),
      };

      const savedOrder = await orderRepository.createOrder(orderData);

      socketManager.broadcastNewOrder(savedOrder);
      matchingEngineService.forwardOrder(savedOrder).catch(() => {});

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: savedOrder,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const { limit = 50, offset = 0, traderType, side } = req.query;

      const result = await orderExecutionService.getOrders({
        limit: Number(limit),
        offset: Number(offset),
        traderType,
        side,
      });

      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
