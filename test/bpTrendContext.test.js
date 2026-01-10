const { applyBpContext } = require("../src/utils/interpreters/bpTrendContext");

describe("BP trend contextual enrichment", () => {
  const baseInterpretation = {
    type: "bp_trend",
    metric: "blood_pressure_systolic",
    direction: "increasing",
    slope: 1.4,
    severity: "warning",
    windowDays: 14,
    message: "Systolic blood pressure has increased over the past 14 days."
  };

  test("adds cold weather context when BP is increasing", () => {
    const result = applyBpContext({
      interpretation: baseInterpretation,
      symptoms: ["cold_weather"]
    });

    expect(result.context).toBeDefined();
    expect(result.context.factor).toBe("cold_weather");
  });

  test("does not add cold weather context when BP is stable", () => {
    const result = applyBpContext({
      interpretation: { ...baseInterpretation, direction: "stable" },
      symptoms: ["cold_weather"]
    });

    expect(result.context).toBeUndefined();
  });

  test("does nothing when no symptoms provided", () => {
    const result = applyBpContext({
      interpretation: baseInterpretation,
      symptoms: []
    });

    expect(result.context).toBeUndefined();
  });
});
