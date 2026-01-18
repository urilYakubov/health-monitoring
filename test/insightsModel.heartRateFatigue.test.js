const insightsModel = require("../src/models/insightsModel");

describe("Heart rate ↔ fatigue correlation data", () => {
  const userId = 1;
  const from = "2024-01-01";
  const to = "2024-12-31";

  test("has enough daily heart_rate data on fatigue days", async () => {
    const stats =
      await insightsModel.getDailyMetricStatsForSymptomDays(
        userId,
        "fatigue",
        "heart_rate",
        3,
        from,
        to
      );

    console.log("Symptom stats:", stats);

    expect(stats).toBeDefined();
    expect(Number(stats.count)).toBeGreaterThanOrEqual(3);
    expect(stats.avg).not.toBeNull();
  });

  test("has enough baseline heart_rate data", async () => {
    const stats =
      await insightsModel.getDailyMetricStatsForBaselineDays(
        userId,
        "heart_rate",
        from,
        to
      );

    console.log("Baseline stats:", stats);

    expect(stats).toBeDefined();
    expect(Number(stats.count)).toBeGreaterThanOrEqual(3);
  });
});
