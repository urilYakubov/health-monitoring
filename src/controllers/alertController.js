const { getAlertsByUser } = require('../models/alertModel');
const logger = require('../utils/logger');

async function listAlerts(req, res) {
  try {
    const alerts = await getAlertsByUser(req.user.id);
    res.json(alerts);
  } catch (err) {
	logger.error('Error fetching alerts', {
	  message: err.message,
	  stack: err.stack
	});
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { listAlerts };