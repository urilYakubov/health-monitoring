const {
  buildBpClinicianSummary
} = require("../src/utils/summaries/bpClinicianSummary");

test("builds clinician BP summary", () => {
  const summary = buildBpClinicianSummary({
    trend: {
      metric: "blood_pressure_systolic",
      direction: "increasing",
      slope: 1.2,
      windowDays: 14,
      details: { fromAvg: 138, toAvg: 145 }
    },
    context: { factor: "cold_weather" },
    correlation: { factor: "cold_temperature" }
  });

  expect(summary.contributingFactors).toContain("cold_weather");
  expect(summary.contributingFactors).toContain("cold_temperature");
});
