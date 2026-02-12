// middleware/validateMetric.js

const VALID_RANGES = {
  heart_rate: { min: 30, max: 220 },
  temperature: { min: 34, max: 42 },
  glucose: { min: 40, max: 600 },
  blood_pressure_systolic: { min: 70, max: 250 },
  blood_pressure_diastolic: { min: 40, max: 150 },
  steps: { min: 0, max: 50000 }
};

function validateMetric(req, res, next) {
  const { metricType, value } = req.body;

  if (!metricType || value == null) {
    return res.status(400).json({
      error: "Missing metric_type or value"
    });
  }

  const range = VALID_RANGES[metricType];

  if (!range) {
    return res.status(400).json({
      error: "Unsupported metric type"
    });
  }

  if (value < range.min || value > range.max) {
    return res.status(422).json({
      error: "Value outside accepted physiological range",
      acceptedRange: range
    });
  }

  next();
}

module.exports = validateMetric;
