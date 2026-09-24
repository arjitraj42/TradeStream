const express = require('express');
const router = express.Router();
const traderController = require('../controllers/traderController');

router.get('/traders', (req, res, next) => traderController.getTraders(req, res, next));
router.put('/traders/:traderType', (req, res, next) => traderController.updateTraderConfig(req, res, next));

module.exports = router;
