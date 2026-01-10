exports.buildBpClinicianSummary = ({
  trend,
  context,
  correlation
}) => {
  if (!trend) return null;

  return {
    category: "blood_pressure",
    metric: trend.metric,
    windowDays: trend.windowDays,
    direction: trend.direction,
    slope: trend.slope,
    averages: {
      from: trend.details?.fromAvg,
      to: trend.details?.toAvg
    },
    contributingFactors: [
      context?.factor,
      correlation?.factor
    ].filter(Boolean),
    note:
      correlation
        ? correlation.message
        : "No clear environmental correlation detected."
  };
};
