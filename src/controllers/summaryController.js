const { getMeanHeartRate } = require("../services/heartRateService");
const { getStepsSummary } = require("../services/stepsService");

exports.getVitalsSummary = async (req, res) => {
  const userId = req.user.id;

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);

  const meanHeartRate = await getMeanHeartRate({ userId, from, to });
  
  const steps = await getStepsSummary({ userId, from, to });

  res.json({
    meanHeartRate,
	steps
  });
};
