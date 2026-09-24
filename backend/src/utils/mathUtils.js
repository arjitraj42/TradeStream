function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundTo(val, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

function calculatePositionSize({ minQuantity = 10, maxQuantity = 500, volatility = 0.03, riskAppetite = 0.5, confidence = 0.8, aggressive = false }) {
  const baseRange = maxQuantity - minQuantity;
  let rawQty = minQuantity + baseRange * (riskAppetite * 0.5 + confidence * 0.5);

  let volMultiplier = 1;
  if (aggressive) {
    volMultiplier = 1 + volatility * 5;
  } else {
    volMultiplier = Math.max(0.3, 1 - volatility * 3);
  }

  const finalQty = Math.round(rawQty * volMultiplier);
  return Math.min(maxQuantity, Math.max(minQuantity, finalQty));
}

function calculateDecayedNewsImpact(initialScore, elapsedSeconds, halfLifeSeconds = 60) {
  if (!initialScore || elapsedSeconds <= 0) return initialScore || 0;
  const decayFactor = Math.pow(0.5, elapsedSeconds / halfLifeSeconds);
  const currentImpact = initialScore * decayFactor;
  return roundTo(currentImpact, 2);
}

module.exports = {
  getRandomNumber,
  getRandomInt,
  roundTo,
  calculatePositionSize,
  calculateDecayedNewsImpact,
};
