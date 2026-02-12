function validateBloodPressure(req, res, next) {
  const { systolic, diastolic } = req.body;

  if (!systolic || !diastolic) {
    return res.status(400).json({
      error: "Missing systolic or diastolic value"
    });
  }

  if (
    systolic < 70 || systolic > 250 ||
    diastolic < 40 || diastolic > 150
  ) {
    return res.status(422).json({
      error: "Blood pressure value outside physiological range"
    });
  }

  next();
}

module.exports = validateBloodPressure;
