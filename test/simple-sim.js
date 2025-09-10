const fetch = require('node-fetch');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzU1MTAxNTQ3LCJleHAiOjE3NTUxMDUxNDd9.7AN2TaOUVEu1pd_jGgkQdm_YXepK4dTUZ1BVfsmAyhY';

async function send(value) {
  await fetch('http://localhost:3000/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ metricType: 'heart_rate', value, recorded_at: new Date().toISOString() })
  });
}

// Send one simulated heart rate value between 60 and 140 bpm
send(60 + Math.round(Math.random() * 80))
  .then(() => console.log('Metric sent!'))
  .catch(err => console.error('Error sending metric:', err));