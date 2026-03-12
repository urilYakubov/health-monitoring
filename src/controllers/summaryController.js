const { getMeanHeartRate } = require("../services/heartRateService");
const { getStepsSummary } = require("../services/stepsService");
const logger = require('../utils/logger');

exports.getVitalsSummary = async (req, res) => {
  const userId = req.user.id;

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  
  try {

	  const meanHeartRate = await getMeanHeartRate({ userId, from, to });
	  
	  const steps = await getStepsSummary({ userId, from, to });

	  res.json({
		meanHeartRate,
		steps
	  });
	  
  } catch (err) {

    logger.error('Vitals summary error', {
	  message: err.message,
	  stack: err.stack,
	  userId,
	  from,
	  to
	});

    res.status(500).json({
      error: "Failed to load Vitals summary"
    });

  }
};

exports.getVitalsSummaryForPatient = async (req, res) => {

  const doctorId = req.user.id;
  const patientId = req.params.patientId;

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);

  try {

    const meanHeartRate = await getMeanHeartRate({
      userId: patientId,
      from,
      to
    });

    const steps = await getStepsSummary({
      userId: patientId,
      from,
      to
    });

    res.json({
      patientId,
      meanHeartRate,
      steps
    });

  } catch (err) {

    logger.error('Vitals summary for patient error', {
	  message: err.message,
	  stack: err.stack,
	  doctorId,
	  patientId,
	  from,
	  to
	});

    res.status(500).json({
      error: "Failed to load Vitals summary for patient"
    });

  }

};
