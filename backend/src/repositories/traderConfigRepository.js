const prisma = require('../config/prisma');
const logger = require('../utils/logger');

const DEFAULT_CONFIGS = {
  MomentumTrader: {
    traderType: 'MomentumTrader',
    displayName: 'Momentum Trader',
    enabled: true,
    confidenceScore: 0.85,
    riskAppetite: 0.70,
    minQuantity: 50,
    maxQuantity: 300,
    customSettings: JSON.stringify({ thresholdPercent: 2.0 }),
  },
  ValueTrader: {
    traderType: 'ValueTrader',
    displayName: 'Value Trader',
    enabled: true,
    confidenceScore: 0.90,
    riskAppetite: 0.40,
    minQuantity: 20,
    maxQuantity: 250,
    customSettings: JSON.stringify({ premiumMultiplier: 1.2 }),
  },
  BearTrader: {
    traderType: 'BearTrader',
    displayName: 'Bear Trader',
    enabled: true,
    confidenceScore: 0.80,
    riskAppetite: 0.65,
    minQuantity: 30,
    maxQuantity: 400,
    customSettings: JSON.stringify({ aggressiveSellMultiplier: 1.5, conservativeBuyQty: 10 }),
  },
  AggressiveTrader: {
    traderType: 'AggressiveTrader',
    displayName: 'Aggressive Trader',
    enabled: true,
    confidenceScore: 0.95,
    riskAppetite: 0.95,
    minQuantity: 100,
    maxQuantity: 1000,
    customSettings: JSON.stringify({ newsImpactThreshold: 7 }),
  },
  MarketMakerTrader: {
    traderType: 'MarketMakerTrader',
    displayName: 'Market Maker Trader',
    enabled: true,
    confidenceScore: 0.99,
    riskAppetite: 0.30,
    minQuantity: 50,
    maxQuantity: 200,
    customSettings: JSON.stringify({ spreadPercent: 0.5 }),
  },
};

const memoryConfigs = new Map(Object.entries(DEFAULT_CONFIGS));

class TraderConfigRepository {
  async getAllConfigs() {
    try {
      if (prisma) {
        const configs = await prisma.traderConfiguration.findMany();
        if (configs && configs.length > 0) {
          return configs;
        }
      }
    } catch (error) {
      logger.warn(`Prisma getAllConfigs error, using memory fallback: ${error.message}`);
    }

    return Array.from(memoryConfigs.values());
  }

  async getConfigByType(traderType) {
    try {
      if (prisma) {
        const config = await prisma.traderConfiguration.findUnique({
          where: { traderType },
        });
        if (config) return config;
      }
    } catch (error) {
      logger.warn(`Prisma getConfigByType error for ${traderType}: ${error.message}`);
    }

    return memoryConfigs.get(traderType) || null;
  }

  async updateConfig(traderType, updateData) {
    let updated;
    try {
      if (prisma) {
        updated = await prisma.traderConfiguration.upsert({
          where: { traderType },
          update: {
            enabled: updateData.enabled !== undefined ? updateData.enabled : undefined,
            confidenceScore: updateData.confidenceScore !== undefined ? Number(updateData.confidenceScore) : undefined,
            riskAppetite: updateData.riskAppetite !== undefined ? Number(updateData.riskAppetite) : undefined,
            minQuantity: updateData.minQuantity !== undefined ? Number(updateData.minQuantity) : undefined,
            maxQuantity: updateData.maxQuantity !== undefined ? Number(updateData.maxQuantity) : undefined,
            customSettings: updateData.customSettings ? JSON.stringify(updateData.customSettings) : undefined,
          },
          create: {
            traderType,
            displayName: updateData.displayName || traderType,
            enabled: updateData.enabled !== undefined ? updateData.enabled : true,
            confidenceScore: Number(updateData.confidenceScore || 0.8),
            riskAppetite: Number(updateData.riskAppetite || 0.5),
            minQuantity: Number(updateData.minQuantity || 10),
            maxQuantity: Number(updateData.maxQuantity || 500),
            customSettings: updateData.customSettings ? JSON.stringify(updateData.customSettings) : null,
          },
        });
      }
    } catch (error) {
      logger.warn(`Prisma updateConfig error for ${traderType}: ${error.message}`);
    }

    const current = memoryConfigs.get(traderType) || { traderType, displayName: traderType };
    const newConfig = {
      ...current,
      ...updateData,
      updatedAt: new Date(),
    };
    memoryConfigs.set(traderType, newConfig);

    return updated || newConfig;
  }

  async seedDefaultConfigs() {
    try {
      if (prisma) {
        for (const config of Object.values(DEFAULT_CONFIGS)) {
          await prisma.traderConfiguration.upsert({
            where: { traderType: config.traderType },
            update: {},
            create: config,
          });
        }
        logger.info('Trader configurations successfully seeded to PostgreSQL DB');
      }
    } catch (error) {
      logger.warn(`Could not seed trader configurations to DB: ${error.message}`);
    }
  }
}

module.exports = new TraderConfigRepository();
