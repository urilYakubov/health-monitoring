const pool = require("../../src/config/db");

test("daily_metric_series has no time_of_day column", async () => {
  const { rows } = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'daily_metric_series'
  `);

  const columns = rows.map(r => r.column_name);
  expect(columns).not.toContain("time_of_day");
});



