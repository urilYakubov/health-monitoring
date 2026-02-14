const bpService = require("../services/bloodPressureService");
const { logAudit } = require('../utils/auditLogger');


exports.createBloodPressure = async (req, res) => {
  const userId = req.user.id;
  const {
    systolic,
    diastolic,
    timeOfDay,
    posture,
    device
  } = req.body;

  if (
    typeof systolic !== "number" ||
    typeof diastolic !== "number"
  ) {
    return res.status(400).json({
      message: "Systolic and diastolic must be numbers"
    });
  }

  try {
    const result = await bpService.recordBloodPressure({
      userId,
      systolic,
      diastolic,
      measuredAt: new Date(),
      timeOfDay,
      posture,
      device
    });
	
	await logAudit({
      userId,
      action: 'CREATE_BLOOD_PRESSURE',
      entity: 'blood_pressure_readings',
      entityId: result?.id ?? null,
      details: {
        systolic,
        diastolic,
        timeOfDay: timeOfDay ?? null,
        posture: posture ?? null,
        device: device ?? null
      }
    });


    res.status(201).json({
      message: "Blood pressure recorded"
    });
  } catch (err) {
    console.error("BP error:", err);
	
	await logAudit({
      userId,
      action: 'CREATE_BLOOD_PRESSURE_FAILED',
      entity: 'blood_pressure_readings',
      details: {
        systolic,
        diastolic,
        error: err.message
      }
    });
	
    res.status(500).json({ message: "Failed to record BP" });
  }
};
