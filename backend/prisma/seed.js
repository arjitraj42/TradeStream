const prisma = require('../src/config/prisma');
const logger = require('../src/utils/logger');
const traderConfigRepository = require('../src/repositories/traderConfigRepository');

async function seed() {
  logger.info('Starting Prisma Database Seeding...');

  // Seed Trader Configurations
  await traderConfigRepository.seedDefaultConfigs();

  // Seed initial sample news events
  if (prisma) {
    try {
      const newsCount = await prisma.newsEvent.count();
      if (newsCount === 0) {
        await prisma.newsEvent.createMany({
          data: [
            {
              headline: 'Market opens with strong bullish momentum across tech stocks',
              sentiment: 'POSITIVE',
              impactScore: 7,
            },
            {
              headline: 'Central Bank announces surprise rate hike fears',
              sentiment: 'NEGATIVE',
              impactScore: 8,
            },
            {
              headline: 'Quarterly financial earnings report matches analyst expectations',
              sentiment: 'NEUTRAL',
              impactScore: 4,
            },
          ],
        });
        logger.info('Sample News Events seeded successfully');
      }
    } catch (err) {
      logger.warn(`Failed to seed news events to Prisma DB: ${err.message}`);
    }
  }

  logger.info('Seeding finished.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Seeding error:', err);
    process.exit(1);
  });
