const clinicalService = require('../services/clinicalProfileService');
const { logAudit } = require('../utils/auditLogger');
const logger = require('../utils/logger');

async function saveProfile(req, res) {
  const userId = req.user.id;
  try {

    const profile = await clinicalService.saveClinicalProfile(userId, req.body);
	
	await logAudit({
		  userId,
		  action: 'create clinical profile',
		  entity: 'clinical_profile',
		  entityId: profile?.id ?? null
		});

    res.json(profile);
  } catch (err) {
	logger.error('saveProfile error', {
		  message: err.message,
		  stack: err.stack,
		  userId
		});

	await logAudit({
		  userId,
		  action: 'CREATE_CLINICAL_PROFILE_FAILED',
		  entity: 'clinical_profile',
		  details: {
			error: err.message
		  }
		});
    res.status(500).json({ error: "Failed to save clinical profile" });
  }
}

async function getProfile(req, res) {
  const userId = req.user.id;
  try {

    const profile = await clinicalService.getClinicalProfile(userId);

    res.json(profile || {}); // return empty object if not found
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clinical profile" });
  }
}

module.exports = {
  saveProfile,
  getProfile
};