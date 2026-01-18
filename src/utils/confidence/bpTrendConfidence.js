// Sample size contribution
function sampleScore(n) {
  if (n >= 14) return 1;
  if (n >= 10) return 0.8;
  if (n >= 7) return 0.5;
  return 0;
}

// Data continuity / gap penalty
function coverageScore(dates) {
  let gaps = 0;

  for (let i = 1; i < dates.length; i++) {
    const delta = (dates[i] - dates[i - 1]) / 86400000;
    if (delta > 2) gaps++;
  }

  if (gaps === 0) return 1;
  if (gaps <= 1) return 0.7;
  return 0.3;
}

// Trend strength
function slopeScore(slope) {
  const abs = Math.abs(slope);
  if (abs >= 1.2) return 1;
  if (abs >= 0.7) return 0.7;
  if (abs >= 0.3) return 0.4;
  return 0;
}

// Noise penalty
function varianceScore(values) {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;

  if (variance < 20) return 1;
  if (variance < 40) return 0.7;
  return 0.3;
}

// Direction consistency
function consistencyScore(values) {
  let flips = 0;

  for (let i = 2; i < values.length; i++) {
    const d1 = values[i - 1] - values[i - 2];
    const d2 = values[i] - values[i - 1];
    if (Math.sign(d1) !== Math.sign(d2)) flips++;
  }

  if (flips <= 1) return 1;
  if (flips <= 3) return 0.6;
  return 0.3;
}

// Final deterministic confidence
function computeConfidence({ values, dates, slope }) {
  const score =
    0.25 * sampleScore(values.length) +
    0.20 * coverageScore(dates) +
    0.25 * slopeScore(slope) +
    0.20 * varianceScore(values) +
    0.10 * consistencyScore(values);

  if (score >= 0.75) return "high";
  if (score >= 0.45) return "moderate";
  return "low";
}

module.exports = {
  computeConfidence,

  // Exported for unit testing
  sampleScore,
  coverageScore,
  slopeScore,
  varianceScore,
  consistencyScore
};
