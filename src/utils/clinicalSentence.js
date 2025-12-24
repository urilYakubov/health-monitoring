// utils/clinicalSentence.js
exports.buildClinicalSentence = ({
  symptom,
  metric,
  symptomAvg,
  baselineAvg,
  count
}) => {
  const delta = Math.round(symptomAvg - baselineAvg);

  const metricLabel =
    metric === "heart_rate"
      ? "heart rate"
      : metric.replace(/_/g, " ");

  const symptomLabel = symptom.replace(/_/g, " ");

  const direction = delta > 0 ? "higher" : "lower";
  
  const unit = metric === "heart_rate" ? "bpm" : "units";

  return `On days with ${symptomLabel} (severity ≥3), average ${metricLabel} was ${Math.abs(
    delta
  )} ${unit} ${direction} than baseline across ${count} days.`;
};
