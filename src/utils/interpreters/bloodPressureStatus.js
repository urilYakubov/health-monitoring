exports.interpretBpStatus = (statusData) => {

  if (!statusData || statusData.status === "unknown") return null;

  const { status, meanSys, meanDia, windowDays } = statusData;

  let label = "";
  let icon = "";

  if (status === "normal") {
    label = "Blood pressure within normal range";
    icon = "🟢";
  }

  if (status === "elevated") {
    label = "Blood pressure mildly elevated";
    icon = "🟡";
  }

  if (status === "high") {
    label = "Blood pressure elevated and may require clinical review";
    icon = "🟠";
  }

  if (status === "critical") {
    label = "Blood pressure critically high";
    icon = "🔴";
  }

  return {
    type: "bp_status",
    title: "Blood Pressure Status",
    icon,
    status,
    message: `${label} based on the average of the past ${windowDays} days (${meanSys}/${meanDia} mmHg).`,
    details: {
      meanSys,
      meanDia,
      windowDays
    },
    disclaimer:
      "Status is informational only and does not replace clinical evaluation."
  };
};