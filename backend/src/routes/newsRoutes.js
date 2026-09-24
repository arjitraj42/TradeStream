const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.post('/news', (req, res, next) => newsController.createNews(req, res, next));
router.get('/news', (req, res, next) => newsController.getNews(req, res, next));

module.exports = router;
