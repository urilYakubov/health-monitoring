const { getRecentMetricValues } = require('../models/healthModel');
const { addAlert } = require('../models/alertModel');
const { findUserById } = require('../models/userModel');
const { sendHealthAlertEmail } = require('./alertService');
const { logAnomaly } = require('../models/anomalyModel');

function calculateAverage(values) {
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

function calculateStdDev(values) {
  const avg = calculateAverage(values);
  const squareDiffs = values.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(calculateAverage(squareDiffs));
}


function detectAnomaly(values, newValue) {
  const avg = calculateAverage(values);
  const stdDev = calculateStdDev(values);
  const threshold = 2;

  const zScore = stdDev === 0 ? 0 : (newValue - avg) / stdDev;
  
  // 🔍 Log the trend analysis
  console.log(`[Anomaly Check] Value=${newValue}, Avg=${avg.toFixed(2)}, StdDev=${stdDev.toFixed(2)}, Z-Score=${zScore.toFixed(2)}`);

  if (Math.abs(zScore) > threshold) {
    return {
      isAnomaly: true,
      avg,
      stdDev,
      threshold,
      zScore
    };
  }

  return {
    isAnomaly: false,
    zScore,
    avg,
    stdDev,
    threshold
  };
}

// --- Main health trend detector ---
async function detectHealthTrend({ userId, metricType, currentValue }) {
  const recentValues = await getRecentMetricValues(userId, metricType, 10);
  if (recentValues.length < 5) return;

  const anomaly = detectAnomaly(recentValues, currentValue);
  if (!anomaly.isAnomaly) return;
  
  // ✅ Save anomaly record
	await logAnomaly({
	  userId,
	  metricType,
	  value: currentValue,
	  avg: anomaly.avg,
	  stdDev: anomaly.stdDev,
	  zScore: anomaly.zScore,
	  threshold: anomaly.threshold
	});

  const alertReason = `🚨 Abnormal ${metricType} trend (Z-score: ${anomaly.zScore.toFixed(2)})`;
  console.error('alert for detectHealthTrend:', alertReason);

  await addAlert({
    userId,
    metricType,
    value: currentValue,
	reason: alertReason
  });

  const user = await findUserById(userId);
  const emailList = [user.email];
  if (user.doctor_email) emailList.push(user.doctor_email);

  const subject = `🧠 Health Alert for ${metricType}`;
  const message = `
    <strong>Abnormal trend detected</strong><br>
    Metric: <b>${metricType}</b><br>
    Value: <b>${currentValue}</b><br>
    Z-score: <b>${anomaly.zScore.toFixed(2)}</b><br>
    Time: ${new Date().toLocaleString()}<br>
    <br>
    <em>${alertReason}</em>
  `;

  for (const to of emailList) {
    await sendHealthAlertEmail({ to, subject, message });
  }
}

module.exports = {
  calculateAverage,
  calculateStdDev,
  detectAnomaly,
  detectHealthTrend // 👈 for use in controller
};
