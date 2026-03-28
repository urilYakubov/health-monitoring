module.exports = (req, res, next) => {
  const { date_of_birth, sex, height_cm, baseline_weight } = req.body;

  if (!date_of_birth) {
    return res.status(400).json({ error: "Date of birth is required" });
  }

  const dob = new Date(date_of_birth);
  if (dob > new Date()) {
    return res.status(400).json({ error: "Invalid date of birth" });
  }

  if (!['male', 'female', 'other'].includes(sex)) {
    return res.status(400).json({ error: "Invalid sex value" });
  }

  if (height_cm && (height_cm < 50 || height_cm > 300)) {
    return res.status(400).json({ error: "Height must be between 50–300 cm" });
  }

  if (baseline_weight && (baseline_weight < 20 || baseline_weight > 300)) {
    return res.status(400).json({ error: "Weight must be between 20–300 kg" });
  }

  next();
};