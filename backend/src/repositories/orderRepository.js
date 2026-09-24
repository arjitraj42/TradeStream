const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const memoryOrders = [];

class OrderRepository {
  async createOrder(orderData) {
    try {
      if (prisma) {
        const created = await prisma.generatedOrder.create({
          data: {
            id: orderData.id,
            traderType: orderData.traderType,
            side: orderData.side,
            orderType: orderData.orderType,
            price: Number(orderData.price),
            quantity: Number(orderData.quantity),
            confidence: orderData.confidence ? Number(orderData.confidence) : 1.0,
            reason: orderData.reason || null,
            forwarded: Boolean(orderData.forwarded),
            timestamp: orderData.timestamp ? new Date(orderData.timestamp) : new Date(),
          },
        });
        memoryOrders.unshift(created);
        return created;
      }
    } catch (error) {
      logger.warn(`Prisma createOrder error, using in-memory fallback: ${error.message}`);
    }

    const fallbackOrder = {
      id: orderData.id || `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      traderType: orderData.traderType,
      side: orderData.side,
      orderType: orderData.orderType,
      price: Number(orderData.price),
      quantity: Number(orderData.quantity),
      confidence: orderData.confidence || 1.0,
      reason: orderData.reason || '',
      forwarded: Boolean(orderData.forwarded),
      timestamp: orderData.timestamp ? new Date(orderData.timestamp) : new Date(),
    };
    memoryOrders.unshift(fallbackOrder);
    return fallbackOrder;
  }

  async createManyOrders(orders) {
    if (!orders || orders.length === 0) return [];
    const saved = [];
    for (const ord of orders) {
      const savedOrd = await this.createOrder(ord);
      saved.push(savedOrd);
    }
    return saved;
  }

  async getOrders({ limit = 50, offset = 0, traderType, side }) {
    try {
      if (prisma) {
        const where = {};
        if (traderType) where.traderType = traderType;
        if (side) where.side = side;

        const orders = await prisma.generatedOrder.findMany({
          where,
          take: Number(limit),
          skip: Number(offset),
          orderBy: { timestamp: 'desc' },
        });

        const totalCount = await prisma.generatedOrder.count({ where });

        return {
          orders,
          total: totalCount,
          limit: Number(limit),
          offset: Number(offset),
        };
      }
    } catch (error) {
      logger.warn(`Prisma getOrders error, using in-memory fallback: ${error.message}`);
    }

    let filtered = [...memoryOrders];
    if (traderType) {
      filtered = filtered.filter(o => o.traderType.toLowerCase() === traderType.toLowerCase());
    }
    if (side) {
      filtered = filtered.filter(o => o.side.toUpperCase() === side.toUpperCase());
    }

    const sliced = filtered.slice(Number(offset), Number(offset) + Number(limit));

    return {
      orders: sliced,
      total: filtered.length,
      limit: Number(limit),
      offset: Number(offset),
    };
  }

  async updateOrderForwardedStatus(orderId, forwarded) {
    try {
      if (prisma) {
        await prisma.generatedOrder.update({
          where: { id: orderId },
          data: { forwarded },
        });
      }
    } catch (error) {
      logger.warn(`Could not update order forwarded status in DB: ${error.message}`);
    }

    const mem = memoryOrders.find(o => o.id === orderId);
    if (mem) mem.forwarded = forwarded;
  }
}

module.exports = new OrderRepository();
