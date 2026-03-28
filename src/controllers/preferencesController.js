const preferencesService = require("../services/preferencesService");
const { logAudit } = require('../utils/auditLogger');
const logger = require('../utils/logger');

exports.getPreferences = async (req, res) => {
  const userId = req.user.id;

  const prefs = await preferencesService.getPreferences(userId);
  res.json(prefs);
};

exports.savePreferences = async (req, res) => {
  const userId = req.user.id;
  const { weight_unit, temperature_unit, timezone } = req.body;
  
  try {
	  const prefs = await preferencesService.savePreferences({
		userId,
		weight_unit,
		temperature_unit,
		timezone
	  });
	  
	  await logAudit({
		  userId,
		  action: 'create preferences',
		  entity: 'user_preferences',
		  entityId: prefs?.id ?? null,
		  details: {
			weight_unit,
			temperature_unit,
			timezone
		  }
		});

	  res.json(prefs);
	} catch (err) {
		logger.error('savePreferences error', {
		  message: err.message,
		  stack: err.stack,
		  userId,
		  weight_unit,
		  temperature_unit,
		  timezone
		});

		await logAudit({
		  userId,
		  action: 'CREATE_PREFERENCES_FAILED',
		  entity: 'user_preferences',
		  details: {
			weight_unit,
			temperature_unit,
			timezone,
			error: err.message
		  }
		});

		const status = err.statusCode || 500;

		res.status(status).json({
		  message: err.message || 'Server error'
		});
	}
};