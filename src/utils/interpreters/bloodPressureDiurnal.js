exports.interpretBpDiurnal = (morning, evening) => {
  if (!morning || !evening) return null;
  if (morning.count < 3 || evening.count < 3) return null;

  const delta = Math.round(morning.avg - evening.avg);

  if (delta >= 10) {
    return {
      metric: "Blood Pressure (Systolic)",
      icon: "🩸",
      message: `Systolic blood pressure was higher in the morning by ${delta} mmHg.`,
      confidence: "Medium"
    };
  }

  return null;
};
