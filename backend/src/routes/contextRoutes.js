const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

router.get('/context', (req, res, next) => marketController.getContext(req, res, next));
router.put('/context', (req, res, next) => marketController.updateContext(req, res, next));

module.exports = router;
