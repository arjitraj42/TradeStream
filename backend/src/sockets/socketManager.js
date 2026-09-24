const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../config/constants');

let io = null;

function initSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}

function getIO() {
  if (!io) {
    logger.warn('Socket.IO requested before initialization');
  }
  return io;
}

function broadcastNewOrder(order) {
  if (io) {
    io.emit(SOCKET_EVENTS.NEW_ORDER, order);
  }
}

function broadcastMarketUpdate(marketContext) {
  if (io) {
    io.emit(SOCKET_EVENTS.MARKET_UPDATE, marketContext);
  }
}

function broadcastNewsEvent(newsEvent) {
  if (io) {
    io.emit(SOCKET_EVENTS.NEWS_EVENT, newsEvent);
  }
}

function broadcastSimulationStatus(status) {
  if (io) {
    io.emit(SOCKET_EVENTS.SIMULATION_STATUS, status);
  }
}

module.exports = {
  initSocketIO,
  getIO,
  broadcastNewOrder,
  broadcastMarketUpdate,
  broadcastNewsEvent,
  broadcastSimulationStatus,
};
