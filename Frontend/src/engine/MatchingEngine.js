/**
 * MatchingEngine.js
 * High-performance, in-memory Price-Time Priority (FIFO) Order Matching Engine
 */

export class MatchingEngine {
  constructor(symbol = 'AAPL') {
    this.symbol = symbol;
    this.orders = new Map(); // Map<orderId, Order>
    this.bids = []; // Descending price order: [{ price: number, totalQuantity: number, orders: Order[] }]
    this.asks = []; // Ascending price order:  [{ price: number, totalQuantity: number, orders: Order[] }]
    this.trades = []; // Array of executed trades
    this.recentQueue = []; // Order queue for visual pipeline animation

    // Metrics
    this.metrics = {
      ordersProcessed: 0,
      tradesExecuted: 0,
      totalLatencyMs: 0,
      lastLatencyMs: 0.12,
      startTime: Date.now(),
    };

    // Counter for ID generation
    this.nextOrderId = 1001;
    this.nextTradeId = 5001;
  }

  setSymbol(newSymbol, basePrice = 180.00) {
    this.symbol = newSymbol;
    this.orders.clear();
    this.bids = [];
    this.asks = [];
    this.trades = [];
    this.recentQueue = [];
    this.seedLiquidity(basePrice);
  }

  /**
   * Seeds the order book with initial two-sided liquidity around basePrice
   */
  seedLiquidity(basePrice = 180.00) {
    const base = parseFloat(basePrice) || 100;
    
    // Seed Bids (below base price)
    for (let i = 1; i <= 8; i++) {
      const price = parseFloat((base - i * 0.25).toFixed(2));
      const qty = Math.floor(Math.random() * 40) + 10;
      this.processOrder({
        side: 'BUY',
        type: 'LIMIT',
        price,
        quantity: qty,
        symbol: this.symbol,
        trader: 'LiquidityProvider',
        skipMetricsCount: true,
      });
    }

    // Seed Asks (above base price)
    for (let i = 1; i <= 8; i++) {
      const price = parseFloat((base + i * 0.25).toFixed(2));
      const qty = Math.floor(Math.random() * 40) + 10;
      this.processOrder({
        side: 'SELL',
        type: 'LIMIT',
        price,
        quantity: qty,
        symbol: this.symbol,
        trader: 'LiquidityProvider',
        skipMetricsCount: true,
      });
    }

    // Reset metrics counter after seeding so user starts clean
    this.metrics.ordersProcessed = 0;
    this.metrics.tradesExecuted = 0;
    this.trades = [];
  }

  /**
   * Core Process Order Entry (Price-Time Priority Matching)
   */
  processOrder(input) {
    const startTime = performance.now();

    const orderId = `ORD-${this.nextOrderId++}`;
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const order = {
      id: orderId,
      symbol: input.symbol || this.symbol,
      side: input.side, // 'BUY' | 'SELL'
      type: input.type, // 'LIMIT' | 'MARKET'
      price: input.type === 'MARKET' ? 0 : parseFloat(input.price),
      initialQuantity: parseInt(input.quantity, 10),
      remainingQuantity: parseInt(input.quantity, 10),
      filledQuantity: 0,
      status: 'OPEN', // 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED'
      timestamp,
      trader: input.trader || 'User (Manual)',
    };

    // Log to recent order queue pipeline
    this.recentQueue.unshift({
      id: order.id,
      side: order.side,
      type: order.type,
      price: order.price,
      quantity: order.remainingQuantity,
      timestamp: order.timestamp,
      trader: order.trader,
      status: 'MATCHING',
    });
    if (this.recentQueue.length > 8) this.recentQueue.pop();

    const newTrades = [];

    if (order.side === 'BUY') {
      this.matchBuyOrder(order, newTrades);
    } else {
      this.matchSellOrder(order, newTrades);
    }

    // Calculate latency
    const endTime = performance.now();
    const latency = Math.max(0.02, parseFloat((endTime - startTime).toFixed(3)));
    
    if (!input.skipMetricsCount) {
      this.metrics.ordersProcessed++;
      this.metrics.totalLatencyMs += latency;
      this.metrics.lastLatencyMs = latency;
    }

    return {
      order,
      trades: newTrades,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Match Incoming BUY Order against ASK Book (lowest ask first)
   */
  matchBuyOrder(order, newTrades) {
    let askIndex = 0;

    while (askIndex < this.asks.length && order.remainingQuantity > 0) {
      const askLevel = this.asks[askIndex];

      // Limit Order Constraint: Ask price must be <= Buyer's limit price
      if (order.type === 'LIMIT' && askLevel.price > order.price) {
        break;
      }

      // Match against FIFO queue at this price level
      let orderIndex = 0;
      while (orderIndex < askLevel.orders.length && order.remainingQuantity > 0) {
        const sellOrder = askLevel.orders[orderIndex];
        const matchQty = Math.min(order.remainingQuantity, sellOrder.remainingQuantity);

        // Execute Trade
        const trade = {
          id: `TRD-${this.nextTradeId++}`,
          timestamp: order.timestamp,
          symbol: order.symbol,
          price: askLevel.price,
          quantity: matchQty,
          buyOrderId: order.id,
          sellOrderId: sellOrder.id,
          takerSide: 'BUY',
        };

        this.trades.unshift(trade);
        newTrades.push(trade);
        this.metrics.tradesExecuted++;

        // Update Quantities
        order.remainingQuantity -= matchQty;
        order.filledQuantity += matchQty;
        sellOrder.remainingQuantity -= matchQty;
        sellOrder.filledQuantity += matchQty;
        askLevel.totalQuantity -= matchQty;

        if (sellOrder.remainingQuantity === 0) {
          sellOrder.status = 'FILLED';
          askLevel.orders.splice(orderIndex, 1);
        } else {
          sellOrder.status = 'PARTIAL';
          orderIndex++;
        }
      }

      // If price level empty, remove level
      if (askLevel.orders.length === 0) {
        this.asks.splice(askIndex, 1);
      } else {
        askIndex++;
      }
    }

    // Post-Match Handling for Unfilled Quantity
    if (order.remainingQuantity > 0) {
      if (order.type === 'LIMIT') {
        order.status = order.filledQuantity > 0 ? 'PARTIAL' : 'OPEN';
        this.insertIntoBidBook(order);
        this.orders.set(order.id, order);
      } else {
        // Unfilled Market Order is cancelled (liquidity consumed)
        order.status = order.filledQuantity > 0 ? 'PARTIAL' : 'CANCELLED';
      }
    } else {
      order.status = 'FILLED';
      this.orders.set(order.id, order);
    }
  }

  /**
   * Match Incoming SELL Order against BID Book (highest bid first)
   */
  matchSellOrder(order, newTrades) {
    let bidIndex = 0;

    while (bidIndex < this.bids.length && order.remainingQuantity > 0) {
      const bidLevel = this.bids[bidIndex];

      // Limit Order Constraint: Bid price must be >= Seller's limit price
      if (order.type === 'LIMIT' && bidLevel.price < order.price) {
        break;
      }

      // Match against FIFO queue at this price level
      let orderIndex = 0;
      while (orderIndex < bidLevel.orders.length && order.remainingQuantity > 0) {
        const buyOrder = bidLevel.orders[orderIndex];
        const matchQty = Math.min(order.remainingQuantity, buyOrder.remainingQuantity);

        // Execute Trade
        const trade = {
          id: `TRD-${this.nextTradeId++}`,
          timestamp: order.timestamp,
          symbol: order.symbol,
          price: bidLevel.price,
          quantity: matchQty,
          buyOrderId: buyOrder.id,
          sellOrderId: order.id,
          takerSide: 'SELL',
        };

        this.trades.unshift(trade);
        newTrades.push(trade);
        this.metrics.tradesExecuted++;

        // Update Quantities
        order.remainingQuantity -= matchQty;
        order.filledQuantity += matchQty;
        buyOrder.remainingQuantity -= matchQty;
        buyOrder.filledQuantity += matchQty;
        bidLevel.totalQuantity -= matchQty;

        if (buyOrder.remainingQuantity === 0) {
          buyOrder.status = 'FILLED';
          bidLevel.orders.splice(orderIndex, 1);
        } else {
          buyOrder.status = 'PARTIAL';
          orderIndex++;
        }
      }

      // If price level empty, remove level
      if (bidLevel.orders.length === 0) {
        this.bids.splice(bidIndex, 1);
      } else {
        bidIndex++;
      }
    }

    // Post-Match Handling for Unfilled Quantity
    if (order.remainingQuantity > 0) {
      if (order.type === 'LIMIT') {
        order.status = order.filledQuantity > 0 ? 'PARTIAL' : 'OPEN';
        this.insertIntoAskBook(order);
        this.orders.set(order.id, order);
      } else {
        order.status = order.filledQuantity > 0 ? 'PARTIAL' : 'CANCELLED';
      }
    } else {
      order.status = 'FILLED';
      this.orders.set(order.id, order);
    }
  }

  /**
   * Insert LIMIT Order into BID Book (Descending Price Order)
   */
  insertIntoBidBook(order) {
    let index = this.bids.findIndex((level) => level.price === order.price);

    if (index !== -1) {
      this.bids[index].orders.push(order);
      this.bids[index].totalQuantity += order.remainingQuantity;
    } else {
      // Find position to keep bids sorted descending
      const insertAt = this.bids.findIndex((level) => level.price < order.price);
      const newLevel = {
        price: order.price,
        totalQuantity: order.remainingQuantity,
        orders: [order],
      };

      if (insertAt === -1) {
        this.bids.push(newLevel);
      } else {
        this.bids.splice(insertAt, 0, newLevel);
      }
    }
  }

  /**
   * Insert LIMIT Order into ASK Book (Ascending Price Order)
   */
  insertIntoAskBook(order) {
    let index = this.asks.findIndex((level) => level.price === order.price);

    if (index !== -1) {
      this.asks[index].orders.push(order);
      this.asks[index].totalQuantity += order.remainingQuantity;
    } else {
      // Find position to keep asks sorted ascending
      const insertAt = this.asks.findIndex((level) => level.price > order.price);
      const newLevel = {
        price: order.price,
        totalQuantity: order.remainingQuantity,
        orders: [order],
      };

      if (insertAt === -1) {
        this.asks.push(newLevel);
      } else {
        this.asks.splice(insertAt, 0, newLevel);
      }
    }
  }

  /**
   * Cancel an Open LIMIT Order by ID
   */
  cancelOrder(orderId) {
    const order = this.orders.get(orderId);
    if (!order || (order.status !== 'OPEN' && order.status !== 'PARTIAL')) {
      return false;
    }

    if (order.side === 'BUY') {
      const levelIndex = this.bids.findIndex((l) => l.price === order.price);
      if (levelIndex !== -1) {
        const level = this.bids[levelIndex];
        const ordIdx = level.orders.findIndex((o) => o.id === orderId);
        if (ordIdx !== -1) {
          level.totalQuantity -= order.remainingQuantity;
          level.orders.splice(ordIdx, 1);
          if (level.orders.length === 0) this.bids.splice(levelIndex, 1);
        }
      }
    } else {
      const levelIndex = this.asks.findIndex((l) => l.price === order.price);
      if (levelIndex !== -1) {
        const level = this.asks[levelIndex];
        const ordIdx = level.orders.findIndex((o) => o.id === orderId);
        if (ordIdx !== -1) {
          level.totalQuantity -= order.remainingQuantity;
          level.orders.splice(ordIdx, 1);
          if (level.orders.length === 0) this.asks.splice(levelIndex, 1);
        }
      }
    }

    order.status = 'CANCELLED';
    return true;
  }

  /**
   * Get Order Book Depth Summary (Top N levels, Best Bid, Best Ask, Spread)
   */
  getOrderBook(depth = 10) {
    const topBids = this.bids.slice(0, depth);
    const topAsks = this.asks.slice(0, depth);

    const bestBid = this.bids.length > 0 ? this.bids[0].price : 0;
    const bestAsk = this.asks.length > 0 ? this.asks[0].price : 0;
    const spread = bestBid && bestAsk ? parseFloat((bestAsk - bestBid).toFixed(2)) : 0;
    const midPrice = bestBid && bestAsk ? parseFloat(((bestBid + bestAsk) / 2).toFixed(2)) : (bestBid || bestAsk || 0);

    const maxBidQty = Math.max(...topBids.map((b) => b.totalQuantity), 1);
    const maxAskQty = Math.max(...topAsks.map((a) => a.totalQuantity), 1);

    const totalOpenBids = this.bids.reduce((acc, l) => acc + l.orders.length, 0);
    const totalOpenAsks = this.asks.reduce((acc, l) => acc + l.orders.length, 0);

    return {
      bids: topBids,
      asks: topAsks,
      bestBid,
      bestAsk,
      spread,
      midPrice,
      maxBidQty,
      maxAskQty,
      totalOpenBids,
      totalOpenAsks,
    };
  }

  /**
   * Get Open Orders array for UI management
   */
  getOpenOrders() {
    const list = [];
    for (const order of this.orders.values()) {
      if (order.status === 'OPEN' || order.status === 'PARTIAL') {
        list.push(order);
      }
    }
    return list.sort((a, b) => b.id.localeCompare(a.id));
  }

  /**
   * Get Engine Performance Metrics
   */
  getMetrics() {
    const elapsedSeconds = Math.max(1, (Date.now() - this.metrics.startTime) / 1000);
    const ordersPerSec = parseFloat((this.metrics.ordersProcessed / elapsedSeconds).toFixed(1));
    const avgLatency = this.metrics.ordersProcessed > 0
      ? parseFloat((this.metrics.totalLatencyMs / this.metrics.ordersProcessed).toFixed(3))
      : 0.15;

    return {
      ordersProcessed: this.metrics.ordersProcessed,
      tradesExecuted: this.metrics.tradesExecuted,
      ordersPerSec,
      avgLatencyMs: avgLatency,
      lastLatencyMs: this.metrics.lastLatencyMs,
    };
  }
}
