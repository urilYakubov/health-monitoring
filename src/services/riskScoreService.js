

function calculateRisk(p) {
  let score = 0;
  let reasons = [];

  /* ---------------- BP ---------------- */
  if (p.systolic >= 160) {
    score += 30;
    reasons.push("Severely elevated BP");
  } else if (p.systolic >= 140) {
    score += 20;
    reasons.push("Elevated BP");
  }

  /* ---------------- Heart Rate ---------------- */
  if (p.heart_rate >= 110) {
    score += 25;
    reasons.push("Very high HR");
  } else if (p.heart_rate >= 100) {
    score += 15;
    reasons.push("High HR");
  }

  /* ---------------- Heart Failure Severity ---------------- */
  if (p.nyha_class >= 3) {
    score += 25;
    reasons.push("Advanced heart failure (NYHA III+)");
  }

  /* ---------------- Alerts (weighted) ---------------- */
  if (p.alerts_count >= 10) {
    score += 25;
    reasons.push("Frequent alerts (last 7 days)");
  } else if (p.alerts_count > 0) {
    score += 10;
    reasons.push("Recent alerts");
  }

  /* ---------------- Weight Change (🔥 VERY IMPORTANT) ---------------- */
  if (p.weight_diff !== undefined && p.weight_diff !== null) {
    if (p.weight_diff >= 2) {
      score += 30;
      reasons.push("Rapid weight gain (fluid retention)");
    } else if (p.weight_diff <= -2) {
      score += 10;
      reasons.push("Weight loss");
    }
  }

  /* ---------------- Normalize ---------------- */
  if (score > 100) score = 100;

  /* ---------------- Level ---------------- */
  let level = "stable";
  if (score >= 70) level = "critical";
  else if (score >= 40) level = "moderate";

  return { score, level, reasons };
}

function calculateRiskV2(p) {
  let score = 0;
  let reasons = [];

  /* ---------------- 1. VITALS ---------------- */

  if (p.systolic >= 160) {
    score += 25;
    reasons.push("Severely elevated BP");
  } else if (p.systolic >= 140) {
    score += 15;
    reasons.push("Elevated BP");
  }

  if (p.heart_rate >= 110) {
    score += 20;
    reasons.push("Very high HR");
  }

  /* ---------------- 2. WEIGHT (CRITICAL IN HF) ---------------- */

  if (p.weight_diff >= 2) {
    score += 30;
    reasons.push("Rapid weight gain (fluid retention)");
  }

  /* ---------------- 3. ALERT BURDEN ---------------- */

  if (p.alerts_count >= 10) {
    score += 20;
    reasons.push("Frequent alerts");
  } else if (p.alerts_count > 0) {
    score += 10;
    reasons.push("Recent alerts");
  }

  /* ---------------- 4. CLINICAL PROFILE ---------------- */

  if (p.nyha_class >= 3) {
    score += 20;
    reasons.push("Advanced HF");
  }

  if (p.lvef && p.lvef < 40) {
    score += 15;
    reasons.push("Reduced ejection fraction");
  }

  if (p.diabetes) {
    score += 5;
  }

  /* ---------------- 5. TREND / DETERIORATION ---------------- */

  if (p.recent_anomalies >= 3) {
    score += 15;
    reasons.push("Multiple recent anomalies");
  }

  /* ---------------- NORMALIZE ---------------- */

  score = Math.min(score, 100);

  /* ---------------- LEVEL ---------------- */

  let level = "stable";
  let action = "Routine follow-up";

  if (score >= 70) {
    level = "critical";
    action = "Call patient today";
  } else if (score >= 40) {
    level = "moderate";
    action = "Monitor closely";
  }

  return { score, level, reasons, action };
}

module.exports = { calculateRisk, calculateRiskV2 };