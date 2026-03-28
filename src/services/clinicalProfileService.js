const clinicalModel = require('../models/clinicalProfileModel');

async function saveClinicalProfile(userId, data) {
  // You can add business logic here later

  return await clinicalModel.upsert(userId, data);
}

async function getClinicalProfile(userId) {
  return await clinicalModel.findByUserId(userId);
}

module.exports = {
  saveClinicalProfile,
  getClinicalProfile
};