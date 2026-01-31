const { getMeanHeartRate } = require("../services/heartRateService");

exports.getVitalsSummary = async (req, res) => {
  const userId = req.user.id;

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);

  const meanHeartRate = await getMeanHeartRate({ userId, from, to });

  res.json({
    meanHeartRate
  });
};
