const { interpretHeartRate } = require("./heartRate");
const { interpretBloodPressure } = require("./bloodPressure");

module.exports = {
  heart_rate: interpretHeartRate,

  blood_pressure_systolic: (symptom, baseline) =>
    interpretBloodPressure(symptom, baseline, "systolic"),

  blood_pressure_diastolic: (symptom, baseline) =>
    interpretBloodPressure(symptom, baseline, "diastolic")
};
