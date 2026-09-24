const traderConfigRepository = require('../repositories/traderConfigRepository');
const { getAllTraders } = require('../traders');
const { updateTraderConfigSchema } = require('../models/dtos');

class TraderController {
  async getTraders(req, res, next) {
    try {
      const dbConfigs = await traderConfigRepository.getAllConfigs();
      const dbMap = new Map(dbConfigs.map(c => [c.traderType, c]));

      const activeTraders = getAllTraders().map(trader => {
        const config = dbMap.get(trader.traderType) || {};
        return {
          traderType: trader.traderType,
          displayName: trader.displayName,
          enabled: config.enabled !== undefined ? config.enabled : true,
          confidenceScore: config.confidenceScore || 0.8,
          riskAppetite: config.riskAppetite || 0.5,
          minQuantity: config.minQuantity || 10,
          maxQuantity: config.maxQuantity || 500,
          customSettings: config.customSettings
            ? (typeof config.customSettings === 'string' ? JSON.parse(config.customSettings) : config.customSettings)
            : null,
          updatedAt: config.updatedAt || null,
        };
      });

      return res.status(200).json({
        success: true,
        count: activeTraders.length,
        data: activeTraders,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTraderConfig(req, res, next) {
    try {
      const { traderType } = req.params;
      const validatedData = updateTraderConfigSchema.parse(req.body);

      const updated = await traderConfigRepository.updateConfig(traderType, validatedData);

      return res.status(200).json({
        success: true,
        message: `Trader configuration for ${traderType} updated successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TraderController();
