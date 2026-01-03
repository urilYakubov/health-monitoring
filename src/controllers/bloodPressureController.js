const bpService = require("../services/bloodPressureService");

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
    await bpService.recordBloodPressure({
      userId,
      systolic,
      diastolic,
      measuredAt: new Date(),
      timeOfDay,
      posture,
      device
    });

    res.status(201).json({
      message: "Blood pressure recorded"
    });
  } catch (err) {
    console.error("BP error:", err);
    res.status(500).json({ message: "Failed to record BP" });
  }
};
