const { spawn } = require('child_process');
const path = require('path');

async function forecastMetric({ userId, metricType }) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../python/forecast_arima.py');
    console.log(`👟 Running: python3 ${scriptPath} ${userId} ${metricType}`);

    const python = spawn('python3', [scriptPath, userId.toString(), metricType]);

    let data = '';
    let error = '';

    python.stdout.on('data', (chunk) => data += chunk);
    python.stderr.on('data', (chunk) => error += chunk);

    python.on('close', (code) => {
      console.log('📥 Python stdout:', data);
      if (error) console.error('🐍 Python stderr:', error);

      if (code !== 0) {
        return reject(error || `Python exited with code ${code}`);
      }

      try {
        const result = JSON.parse(data);
        resolve(result);
      } catch (err) {
        console.error('❌ JSON Parse Error:', err);
        reject('Failed to parse ARIMA output');
      }
    });
  });
}

module.exports = { forecastMetric };