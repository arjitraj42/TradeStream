const cron = require('node-cron');
const config = require('../config/env');
const logger = require('../utils/logger');
const marketContextService = require('../services/marketContextService');
const orderExecutionService = require('../services/orderExecutionService');
const socketManager = require('../sockets/socketManager');

class SimulationScheduler {
  constructor() {
    this.task = null;
    this.isRunning = false;
    this.scheduleExpression = config.SIMULATION_CRON_SCHEDULE;
    this.totalTicks = 0;
    this.lastRunTime = null;
  }

  start() {
    if (this.isRunning && this.task) {
      logger.info('Simulation Scheduler is already running');
      return this.getStatus();
    }

    logger.info(`Starting Simulation Scheduler with cron schedule: "${this.scheduleExpression}"`);

    this.task = cron.schedule(this.scheduleExpression, async () => {
      await this.runTick();
    });

    this.isRunning = true;
    socketManager.broadcastSimulationStatus(this.getStatus());
    return this.getStatus();
  }

  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
    this.isRunning = false;
    logger.info('Simulation Scheduler stopped');
    socketManager.broadcastSimulationStatus(this.getStatus());
    return this.getStatus();
  }

  async runTick() {
    try {
      this.totalTicks += 1;
      this.lastRunTime = new Date();

      if (config.AUTO_SIMULATE_PRICE_MOVEMENT) {
        marketContextService.simulateTick();
      }

      const updatedContext = marketContextService.getContext();
      socketManager.broadcastMarketUpdate(updatedContext);

      const result = await orderExecutionService.executeSimulationCycle();

      return {
        tickIndex: this.totalTicks,
        timestamp: this.lastRunTime,
        context: result.context,
        generatedOrdersCount: result.orders.length,
        orders: result.orders,
      };
    } catch (error) {
      logger.error(`Error during simulation tick execution: ${error.message}`);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduleExpression: this.scheduleExpression,
      totalTicksExecuted: this.totalTicks,
      lastRunTime: this.lastRunTime,
    };
  }
}

module.exports = new SimulationScheduler();
