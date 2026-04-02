function calculateWeightChange(current, baseline) {
  if (!current || !baseline) return null;

  const diff = current - baseline;

  return {
    value: Number(diff.toFixed(1)),
    sign: diff >= 0 ? "+" : ""
  };
}

module.exports = { calculateWeightChange };