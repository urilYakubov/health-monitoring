const { calculateWeightChange } = require('../../src/utils/weightUtils');

describe("Weight Change", () => {

  test("should calculate positive weight gain", () => {
    const result = calculateWeightChange(70, 67);

    expect(result.value).toBe(3.0);
    expect(result.sign).toBe("+");
  });

  test("should calculate weight loss", () => {
    const result = calculateWeightChange(65, 67);

    expect(result.value).toBe(-2.0);
    expect(result.sign).toBe("");
  });

  test("should return null if missing data", () => {
    const result = calculateWeightChange(null, 67);

    expect(result).toBeNull();
  });

});