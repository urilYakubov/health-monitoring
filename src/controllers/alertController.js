const { getAlertsByUser } = require('../models/alertModel');

async function listAlerts(req, res) {
  try {
    const alerts = await getAlertsByUser(req.user.id);
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listAlerts };