const { z } = require('zod');

const createNewsSchema = z.object({
  headline: z.string().min(3, 'Headline must be at least 3 characters long'),
  sentiment: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL'], {
    errorMap: () => ({ message: 'Sentiment must be POSITIVE, NEGATIVE, or NEUTRAL' }),
  }),
  impactScore: z.number().int().min(1).max(10, 'Impact score must be between 1 and 10'),
});

const updateMarketContextSchema = z.object({
  currentPrice: z.number().positive('Price must be greater than 0').optional(),
  fairValue: z.number().positive('Fair value must be greater than 0').optional(),
  volatility: z.number().min(0.001).max(0.50).optional(),
});

const updateTraderConfigSchema = z.object({
  enabled: z.boolean().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  riskAppetite: z.number().min(0).max(1).optional(),
  minQuantity: z.number().int().positive().optional(),
  maxQuantity: z.number().int().positive().optional(),
  customSettings: z.record(z.any()).optional(),
});

module.exports = {
  createNewsSchema,
  updateMarketContextSchema,
  updateTraderConfigSchema,
};
