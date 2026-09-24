const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', (req, res, next) => orderController.createOrder(req, res, next));
router.get('/orders', (req, res, next) => orderController.getOrders(req, res, next));

module.exports = router;
