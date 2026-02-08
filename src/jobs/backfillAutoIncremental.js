const pool = require("../config/db");

async function backfillAutoIncremental() {
  console.log("🔄 Running automatic incremental backfill...");

  // 1️⃣ Get latest processed date
  const { rows } = await pool.query(`
    SELECT MAX(date) AS last_date
    FROM daily_metric_series
  `);

  const lastDate = rows[0].last_date;

  console.log("Last aggregated date:", lastDate);

  // If table empty → process everything
  const dateConditionHealth = lastDate
    ? `WHERE recorded_at >= $1`
    : ``;

  const dateConditionBP = lastDate
    ? `WHERE measured_at >= $1`
    : ``;

  const params = lastDate ? [lastDate] : [];

  /*
   * 2️⃣ HEALTH DATA
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
      AVG(value),
      MIN(value),
      MAX(value),
      COUNT(*),
      COUNT(DISTINCT DATE_TRUNC('minute', recorded_at))
    FROM health_data
    ${dateConditionHealth}
    GROUP BY user_id, DATE(recorded_at), metric_type
    ON CONFLICT (user_id, date, metric)
    DO UPDATE SET
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      sample_count = EXCLUDED.sample_count,
      coverage_minutes = EXCLUDED.coverage_minutes;
  `, params);

  /*
   * 3️⃣ BLOOD PRESSURE – SYSTOLIC
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
      DATE(measured_at),
      'blood_pressure_systolic',
      AVG(systolic),
      MIN(systolic),
      MAX(systolic),
      COUNT(*)
    FROM blood_pressure_readings
    ${dateConditionBP}
    GROUP BY user_id, DATE(measured_at)
    ON CONFLICT (user_id, date, metric)
    DO UPDATE SET
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      sample_count = EXCLUDED.sample_count;
  `, params);

  /*
   * 4️⃣ BLOOD PRESSURE – DIASTOLIC
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
      DATE(measured_at),
      'blood_pressure_diastolic',
      AVG(diastolic),
      MIN(diastolic),
      MAX(diastolic),
      COUNT(*)
    FROM blood_pressure_readings
    ${dateConditionBP}
    GROUP BY user_id, DATE(measured_at)
    ON CONFLICT (user_id, date, metric)
    DO UPDATE SET
      avg_value = EXCLUDED.avg_value,
      min_value = EXCLUDED.min_value,
      max_value = EXCLUDED.max_value,
      sample_count = EXCLUDED.sample_count;
  `, params);

  console.log("✅ Incremental backfill completed successfully");
}

backfillAutoIncremental()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Incremental backfill failed:", err);
    process.exit(1);
  });
