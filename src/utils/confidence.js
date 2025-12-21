// utils/confidence.js
exports.calculateConfidence = (count) => {
  if (count >= 10) return "High";
  if (count >= 5) return "Medium";
  if (count >= 3) return "Low";
  return null;
};
