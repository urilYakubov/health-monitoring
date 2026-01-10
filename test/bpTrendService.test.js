const bpTrendService = require("../src/services/bpTrendService");
const bpModel = require("../src/models/bloodPressureModel");

jest.mock("../src/models/bloodPressureModel");

describe("bpTrendService.getBpTrend", () => {
  const userId = 1;
  const metric = "blood_pressure_systolic";

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("detects increasing trend", async () => {
    bpModel.getBpTrendData.mockResolvedValue([
      { value: 130 },
      { value: 131 },
      { value: 132 },
      { value: 133 },
      { value: 138 },
      { value: 140 },
      { value: 141 },
      { value: 142 }
    ]);

    const result = await bpTrendService.getBpTrend({
      userId,
      metric
    });

    expect(result.direction).toBe("increasing");
    expect(result.fromAvg).toBeLessThan(result.toAvg);
    expect(result.windowDays).toBe(14);
  });

  test("detects decreasing trend", async () => {
    bpModel.getBpTrendData.mockResolvedValue([
      { value: 145 },
      { value: 144 },
      { value: 143 },
      { value: 142 },
      { value: 139 },
      { value: 138 },
      { value: 137 },
      { value: 136 }
    ]);

    const result = await bpTrendService.getBpTrend({
      userId,
      metric
    });

    expect(result.direction).toBe("decreasing");
    expect(result.fromAvg).toBeGreaterThan(result.toAvg);
  });

  test("detects stable trend when change is small", async () => {
    bpModel.getBpTrendData.mockResolvedValue([
      { value: 135 },
      { value: 136 },
      { value: 135 },
      { value: 136 },
      { value: 136 },
      { value: 135 },
      { value: 136 },
      { value: 135 }
    ]);

    const result = await bpTrendService.getBpTrend({
      userId,
      metric
    });

    expect(result.direction).toBe("stable");
  });

  test("returns null if insufficient data", async () => {
    bpModel.getBpTrendData.mockResolvedValue([
      { value: 140 },
      { value: 141 }
    ]);

    const result = await bpTrendService.getBpTrend({
      userId,
      metric
    });

    expect(result).toBeNull();
  });

  test("passes timeOfDay to model correctly", async () => {
    bpModel.getBpTrendData.mockResolvedValue([
      { value: 130 },
      { value: 132 },
      { value: 134 },
      { value: 136 },
      { value: 138 },
      { value: 140 }
    ]);

    await bpTrendService.getBpTrend({
      userId,
      metric,
      timeOfDay: "morning"
    });

    expect(bpModel.getBpTrendData).toHaveBeenCalledWith(
      expect.objectContaining({
        timeOfDay: "morning"
      })
    );
  });
});
