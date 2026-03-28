const preferencesModel = require("../models/preferencesModel");

exports.getPreferences = async (userId) => {
  let prefs = await preferencesModel.getByUserId(userId);

  if (!prefs) {
    // create default
    prefs = await preferencesModel.createDefault(userId);
  }

  return prefs;
};

exports.savePreferences = async ({ userId, weight_unit, temperature_unit, timezone }) => {
  return await preferencesModel.upsert({
    userId,
    weight_unit,
    temperature_unit,
    timezone
  });
};
