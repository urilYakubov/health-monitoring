const pool = require("../db");

async function backfillDailyMetricsForDate(date) {
  console.log(`🔄 Backfilling metrics for ${date}`);

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
      DATE(timestamp) AS date,
      metric,
      AVG(value),
      MIN(value),
      MAX(value),
      COUNT(*),
      COUNT(*) * 1 -- minutes approximation
    FROM health_data
    WHERE DATE(timestamp) = $1
    GROUP BY user_id, DATE(timestamp), metric
    ON CONFLICT (user_id, date, metric)
    DO NOTHING;
  `, [date]);

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
      DATE(measured_at) AS date,
      CASE
        WHEN type = 'systolic' THEN 'blood_pressure_systolic'
        ELSE 'blood_pressure_diastolic'
      END,
      AVG(value),
      MIN(value),
      MAX(value),
      COUNT(*),
      COUNT(*) * 1
    FROM blood_pressure_readings
    WHERE DATE(measured_at) = $1
    GROUP BY user_id, DATE(measured_at), type
    ON CONFLICT (user_id, date, metric)
    DO NOTHING;
  `, [date]);

  console.log(`✅ Backfill done for ${date}`);
}

async function run() {
  const today = new Date().toISOString().slice(0, 10);
  await backfillDailyMetricsForDate(today);
  process.exit(0);
}

run();
