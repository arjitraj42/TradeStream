const simulationScheduler = require('../scheduler/simulationScheduler');

class SimulationController {
  async runSimulation(req, res, next) {
    try {
      const result = await simulationScheduler.runTick();

      return res.status(200).json({
        success: true,
        message: 'Simulation tick executed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async startSimulation(req, res, next) {
    try {
      const status = simulationScheduler.start();
      return res.status(200).json({
        success: true,
        message: 'Simulation scheduler started',
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  async stopSimulation(req, res, next) {
    try {
      const status = simulationScheduler.stop();
      return res.status(200).json({
        success: true,
        message: 'Simulation scheduler stopped',
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSimulationStatus(req, res, next) {
    try {
      const status = simulationScheduler.getStatus();
      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SimulationController();
