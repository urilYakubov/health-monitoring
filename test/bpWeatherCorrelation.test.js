const {
  analyzeBpWeatherCorrelation
} = require("../src/services/bpWeatherCorrelationService");

test("detects cold weather BP elevation pattern", () => {
  const bpSeries = [
    { date: "2025-01-01", value: 145 },
    { date: "2025-01-02", value: 142 },
    { date: "2025-01-03", value: 138 },
    { date: "2025-01-04", value: 146 },
    { date: "2025-01-05", value: 150 }
  ];

  const weatherSeries = [
    { date: "2025-01-01", avgTemp: 8 },
    { date: "2025-01-02", avgTemp: 7 },
    { date: "2025-01-03", avgTemp: 6 },
    { date: "2025-01-04", avgTemp: 9 },
    { date: "2025-01-05", avgTemp: 8 }
  ];

  const result = analyzeBpWeatherCorrelation({ bpSeries, weatherSeries });

  expect(result).not.toBeNull();
  expect(result.factor).toBe("cold_temperature");
});
