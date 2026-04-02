const { calculateRisk } = require('../../src/services/riskScoreService');

describe("Risk Score Service", () => {

  test("should return high risk for critical patient", () => {
    const patient = {
      systolic: 170,
      heart_rate: 110,
      nyha_class: 3,
      alerts_count: 2
    };

    const result = calculateRisk(patient);

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.level).toBe("critical");
  });

  test("should return stable for healthy patient", () => {
    const patient = {
      systolic: 120,
      heart_rate: 70,
      nyha_class: 1,
      alerts_count: 0
    };

    const result = calculateRisk(patient);

    expect(result.level).toBe("stable");
  });

});