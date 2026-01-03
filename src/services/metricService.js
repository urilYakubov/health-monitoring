// services/metricService.js
const { addMetric } = require('../models/healthModel');
const { addAlert } = require('../models/alertModel');
const { sendHealthAlertEmail } = require('./alertService');
const { findUserById } = require('../models/userModel');
const { detectHealthTrend } = require('./trendDetectionService');

function generateHealthAlert({ metricType, value }) {
  if (metricType === 'temperature' && value > 38.5) return 'Fever risk';
  if (metricType === 'heart_rate' && value > 100) return 'High heart rate';
  if (metricType === 'blood_pressure_systolic' && value > 130)
    return 'High systolic blood pressure';
  if (metricType === 'blood_pressure_diastolic' && value > 80)
    return 'High diastolic blood pressure';
  if (metricType === 'blood_sugar' && (value > 140 || value < 70))
    return 'Abnormal blood sugar';

  return null;
}

async function createMetricInternal({ userId, metricType, value }) {
  const alert = generateHealthAlert({ metricType, value });

  const result = await addMetric(userId, metricType, value, alert);

  if (alert) {
    await addAlert({
      userId,
      metricType,
      value,
      reason: alert
    });

    const user = await findUserById(userId);
    const recipients = [user.email];
    if (user.doctor_email) recipients.push(user.doctor_email);

    for (const to of recipients) {
      await sendHealthAlertEmail({
        to,
        subject: `⚠️ Health Alert`,
        message: `
          <strong>${alert}</strong><br>
          Metric: ${metricType}<br>
          Value: ${value}<br>
          Time: ${new Date().toLocaleString()}
        `
      });
    }
  }

  await detectHealthTrend({ userId, metricType, currentValue: value });

  return result;
}

module.exports = {
  createMetricInternal
};
