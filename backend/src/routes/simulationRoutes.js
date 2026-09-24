const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.post('/simulation/run', (req, res, next) => simulationController.runSimulation(req, res, next));
router.post('/simulation/start', (req, res, next) => simulationController.startSimulation(req, res, next));
router.post('/simulation/stop', (req, res, next) => simulationController.stopSimulation(req, res, next));
router.get('/simulation/status', (req, res, next) => simulationController.getSimulationStatus(req, res, next));

module.exports = router;
