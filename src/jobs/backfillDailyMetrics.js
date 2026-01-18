const pool = require("../config/db");

async function backfillDailyMetrics() {
  console.log("🔄 Backfilling daily_metric_series...");

  /**
   * 1️⃣ Heart rate, temperature, glucose, etc.
   *    From health_data
   */
  await pool.query(`
    INSERT INTO daily_metric_series (
      user_id,
      date,
      metric,
      avg_value,
      min_value,
      max_value,
      sample_count,
      coverage_minutes
    )
    SELECT
      user_id,
      DATE(recorded_at) AS date,
      metric_type AS metric,
      AVG(value) AS avg_value,
      MIN(value) AS min_value,
      MAX(value) AS max_value,
      COUNT(*) AS sample_count,
      COUNT(DISTINCT DATE_TRUNC('minute', recorded_at)) AS coverage_minutes
    FROM health_data
    GROUP BY user_id, DATE(recorded_at), metric_type
    ON CONFLICT (user_id, date, metric)
    DO UPDATE SET
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      sample_count = EXCLUDED.sample_count,
      coverage_minutes = EXCLUDED.coverage_minutes;
  `);

  /**
   * 2️⃣ Blood pressure → split into systolic / diastolic metrics
   */
  await pool.query(`
    INSERT INTO daily_metric_series (
      user_id,
      date,
      metric,
      avg_value,
      min_value,
      max_value,
      sample_count
    )
    SELECT
      user_id,
      DATE(measured_at) AS date,
      'blood_pressure_systolic' AS metric,
      AVG(systolic),
      MIN(systolic),
      MAX(systolic),
      COUNT(*)
    FROM blood_pressure_readings
    GROUP BY user_id, DATE(measured_at)
    ON CONFLICT (user_id, date, metric)
    DO UPDATE SET
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      sample_count = EXCLUDED.sample_count;
  `);

  await pool.query(`
    INSERT INTO daily_metric_series (
      user_id,
      date,
      metric,
      avg_value,
      min_value,
      max_value,
      sample_count
    )
    SELECT
      user_id,
      DATE(measured_at) AS date,
      'blood_pressure_diastolic' AS metric,
      AVG(diastolic),
      MIN(diastolic),
      MAX(diastolic),
      COUNT(*)
    FROM blood_pressure_readings
    GROUP BY user_id, DATE(measured_at)
    ON CONFLICT (user_id, date, metric)
    DO UPDATE SET
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      sample_count = EXCLUDED.sample_count;
  `);

  console.log("✅ daily_metric_series backfill complete");
}

backfillDailyMetrics()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  });
