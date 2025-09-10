const { addMetric, getMetricsByUser, getRecentMetricValues } = require('../models/healthModel');
const { sendHealthAlertEmail } = require('../services/alertService');
const { findUserById } = require('../models/userModel'); // You'll create this
const { addAlert } = require('../models/alertModel');
const { detectHealthTrend } = require('../services/trendDetectionService');
const { forecastMetric } = require('../services/forecastService');

function generateHealthAlert({ metricType, value }) {
  if (metricType === 'temperature' && value > 38.5) {
    return 'Fever risk';
  }
  
  if (metricType === 'heart_rate' && value > 100) {
    return 'High heart rate';
  }
  
  if (metricType === 'blood_pressure_systolic' && value > 130) {
    return 'High systolic blood pressure';
  }

  if (metricType === 'blood_pressure_diastolic' && value > 80) {
    return 'High diastolic blood pressure';
  }

  if (metricType === 'blood_sugar' && (value > 140 || value < 70)) {
    return 'Abnormal blood sugar';
  }

  return null;
}

async function createMetric(req, res) {
  const { metricType, value, heart_rate, blood_pressure_systolic, blood_pressure_diastolic } = req.body;
  const userId = req.user.id;
  
  console.log('📥 createMetric function req.body:', req.body);

  if (!metricType || typeof value !== 'number') {
    return res.status(400).json({ message: 'metricType and numeric value are required' });
  }
  console.log('📥 Creating metric for user ID:', req.user.id);  // in createMetric
  
  const alert = generateHealthAlert({
    metricType,
    value
  });

  try {
    console.log('Decoded JWT user:', req.user);
	console.log('Calling addMetric with:', {
	  userId,
	  metricType,
	  value,
	  alert
	});
    const result = await addMetric(
      userId,
      metricType,
      value,
	  alert
    );
	
	// If alert exists, send email
    if (alert) {
	  await addAlert({
		  userId,
		  metricType,
		  value,
		  reason: alert
		});
		
      const user = await findUserById(userId);
      const emailList = [user.email];

      if (user.doctor_email) {
        emailList.push(user.doctor_email);
      }

      const subject = `⚠️ Health Alert for ${user.email}`;
      const message = `
        <strong>Health Alert Triggered</strong><br>
        <ul>
          <li>Metric Type: ${metricType}</li>
          <li>Value: ${value}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p><strong>Reason:</strong> ${alert}</p>
      `;

      for (const to of emailList) {
        await sendHealthAlertEmail({ to, subject, message });
      }
    }
	
	// 📈 Trend detection (AI-based placeholder logic)
	await detectHealthTrend({ userId, metricType, currentValue: value });
	
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating metric:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function listMetrics(req, res) {
  try {
    const metrics = await getMetricsByUser(req.user.id);
	//console.log('📊 Metrics returned from DB:', metrics); // <- add this
	//console.log('📤 Listing metrics for user ID:', req.user.id);  // in listMetrics
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
	
	// Forecast alert thresholds
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
      // Save forecast alert
      await addAlert({
        userId,
        metricType,
        value: result.forecast[0],
        alertReason: reason
      });

      // Optional: Fetch user and send email
      const user = await findUserById(userId);
      const emailList = [user.email];
      if (user.doctor_email) emailList.push(user.doctor_email);

      const subject = `⚠️ Forecast Health Alert for ${metricType}`;
      const message = `
        <strong>Forecast Alert Triggered</strong><br>
        <ul>
          <li>Metric Type: ${metricType}</li>
          <li>Forecasted Values: ${result.forecast.map(v => v.toFixed(1)).join(', ')}</li>
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

module.exports = { createMetric, listMetrics, forecastMetricRoute };
