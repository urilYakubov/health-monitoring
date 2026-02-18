const { getMetricsByUser } = require('../models/healthModel');
const { sendHealthAlertEmail } = require('../services/alertService');
const { findUserById } = require('../models/userModel');
const { addAlert } = require('../models/alertModel');
const { forecastMetric } = require('../services/forecastService');
const { createMetric: createMetricService } = require('../services/metricService');
const { logAudit } = require('../utils/auditLogger');


async function createMetric(req, res) {
  const { metricType, value } = req.body;
  const userId = req.user.id;

  if (!metricType || typeof value !== 'number') {
    return res.status(400).json({
      message: 'metricType and numeric value are required'
    });
  }

  try {
    const result = await createMetricService({
      userId,
      metricType,
      value
    });

    await logAudit({
      userId,
      action: 'CREATE_METRIC',
      entity: 'health_data',
      entityId: result?.id ?? null,
      details: { metricType, value }
    });

    res.status(201).json(result);

  } catch (err) {
    console.error('Error creating metric:', err);

    await logAudit({
      userId,
      action: 'CREATE_METRIC_FAILED',
      entity: 'health_data',
      details: {
        metricType,
        value,
        error: err.message
      }
    });

    const status = err.statusCode || 500;

    res.status(status).json({
      message: err.message || 'Internal server error'
    });
  }
}


async function listMetrics(req, res) {
  try {
    const metrics = await getMetricsByUser(req.user.id);
    res.json(metrics);
  } catch (err) {
    console.error('Error fetching metrics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}


async function forecastMetricRoute(req, res) {
  const userId = req.user.id;
  const { metricType } = req.query;

  if (!metricType) {
    return res.status(400).json({ message: 'metricType is required' });
  }

  try {
    const forecast = await forecastMetric({ userId, metricType });

    let isAbnormal = false;
    let reason = '';

    if (metricType === 'blood_sugar' && forecast.some(v => v > 140 || v < 70)) {
      isAbnormal = true;
      reason = 'Forecasted blood sugar is out of safe range';
    }

    if (metricType === 'heart_rate' && forecast.some(v => v > 120 || v < 50)) {
      isAbnormal = true;
      reason = 'Forecasted heart rate is abnormal';
    }

    if (metricType === 'temperature' && forecast.some(v => v > 38.5)) {
      isAbnormal = true;
      reason = 'Forecasted temperature suggests possible fever';
    }

    if (isAbnormal) {

      await addAlert({
        userId,
        metricType,
        value: forecast[0],
        alertReason: reason
      });

      const user = await findUserById(userId);
      const emailList = [user.email];
      if (user.doctor_email) emailList.push(user.doctor_email);

      const subject = `⚠️ Forecast Health Alert for ${metricType}`;
      const message = `
        <strong>Forecast Alert Triggered</strong><br>
        <ul>
          <li>Metric Type: ${metricType}</li>
          <li>Forecasted Values: ${forecast.map(v => v.toFixed(1)).join(', ')}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p><strong>Reason:</strong> ${reason}</p>
      `;

      for (const to of emailList) {
        await sendHealthAlertEmail({ to, subject, message });
      }
    }

    res.json({ forecast });

  } catch (err) {
    console.error('Error forecasting metric:', err);
    res.status(500).json({ message: 'Failed to forecast metric' });
  }
}

module.exports = {
  createMetric,
  listMetrics,
  forecastMetricRoute
};
