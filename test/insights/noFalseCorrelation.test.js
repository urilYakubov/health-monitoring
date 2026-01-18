
test("returns weak insight instead of null when delta is small", () => {
  const interpreter = require("../../src/utils/interpreters/heartRate");

  const result = interpreter.interpretHeartRate(
    { avg: 72, count: 6 },
    { avg: 71, count: 12 }
  );

  expect(result).not.toBeNull();
  expect(result.confidence).toBe("very_low");
});

test("returns high confidence insight when delta and samples are strong", () => {
  const interpreter = require("../../src/utils/interpreters/heartRate");

  const result = interpreter.interpretHeartRate(
    { avg: 80, count: 8 },
    { avg: 70, count: 20 }
  );

  expect(result.confidence).toBe("high");
});

