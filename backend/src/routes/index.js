const express = require('express');
const router = express.Router();

const contextRoutes = require('./contextRoutes');
const newsRoutes = require('./newsRoutes');
const orderRoutes = require('./orderRoutes');
const traderRoutes = require('./traderRoutes');
const simulationRoutes = require('./simulationRoutes');

router.use('/', contextRoutes);
router.use('/', newsRoutes);
router.use('/', orderRoutes);
router.use('/', traderRoutes);
router.use('/', simulationRoutes);

module.exports = router;
