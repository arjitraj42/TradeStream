const marketContextService = require('../services/marketContextService');
const { updateMarketContextSchema } = require('../models/dtos');

class MarketController {
  async getContext(req, res, next) {
    try {
      const context = marketContextService.getContext();
      return res.status(200).json({
        success: true,
        data: context,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateContext(req, res, next) {
    try {
      const validated = updateMarketContextSchema.parse(req.body);
      const updated = marketContextService.updateContext(validated);
      return res.status(200).json({
        success: true,
        message: 'Market context updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MarketController();
