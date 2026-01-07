const bpModel = require("../src/models/bloodPressureModel");
const pool = require("../src/config/db");

jest.setTimeout(15000);

describe("Blood pressure diurnal analysis", () => {
  const userId = 1;

  beforeAll(async () => {
    // Clean test data
    await pool.query(
      "DELETE FROM blood_pressure_readings WHERE user_id = $1",
      [userId]
    );

    // Insert controlled test data
    const readings = [
      // Day 1
      [140, 85, "2025-01-01 08:00", "morning"],
      [150, 90, "2025-01-01 20:00", "evening"],

      // Day 2
      [138, 84, "2025-01-02 08:00", "morning"],
      [148, 88, "2025-01-02 20:00", "evening"],

      // Day 3
      [142, 86, "2025-01-03 08:00", "morning"],
      [152, 92, "2025-01-03 20:00", "evening"],

      // Day 4
      [145, 88, "2025-01-04 08:00", "morning"],
      [155, 94, "2025-01-04 20:00", "evening"]
    ];

    for (const [systolic, diastolic, measuredAt, timeOfDay] of readings) {
      await bpModel.insertReading({
        userId,
        systolic,
        diastolic,
        measuredAt,
        timeOfDay
      });
    }
  });
  
  afterAll(async () => {
	  try {
		await pool.end();
	  } catch (e) {
		console.error("Error closing DB pool", e);
	  }
	});

  test("Morning vs evening systolic averages differ correctly", async () => {
    const from = "2025-01-01";
    const to = "2025-01-04";

    const morning = await bpModel.getBpByTimeOfDay({
      userId,
      from,
      to,
      timeOfDay: "morning"
    });

    const evening = await bpModel.getBpByTimeOfDay({
      userId,
      from,
      to,
      timeOfDay: "evening"
    });
	
	console.log("Morning rows:", morning);
    console.log("Evening rows:", evening);

    expect(morning.count).toBe(4);
    expect(evening.count).toBe(4);

    expect(Math.round(morning.avg)).toBe(141);
    expect(Math.round(evening.avg)).toBe(151);

    expect(evening.avg).toBeGreaterThan(morning.avg);
	
  });
});
