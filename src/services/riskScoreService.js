

function calculateRisk(p) {
  let score = 0;
  let reasons = [];

  if (p.systolic > 160) {
    score += 30;
    reasons.push("High BP");
  }

  if (p.heart_rate > 100) {
    score += 20;
    reasons.push("High HR");
  }

  if (p.nyha_class >= 3) {
    score += 25;
    reasons.push("Advanced HF");
  }

  if (p.alerts_count > 0) {
    score += 15;
    reasons.push("Active alerts");
  }

  let level = "stable";
  if (score >= 70) level = "critical";
  else if (score >= 40) level = "moderate";

  return { score, level, reasons };
}



module.exports = { calculateRisk };