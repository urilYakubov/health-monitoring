const pool = require("../config/db");

async function backfillDailyMetricsForDate(date) {
  console.log(`🔄 Backfilling metrics for ${date}`);

  /**
   * 1️⃣ Backfill non-BP metrics from health_data
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
      COUNT(*) -- conservative minutes proxy
    FROM health_data
    WHERE DATE(recorded_at) = $1
    GROUP BY user_id, DATE(recorded_at), metric_type
    ON CONFLICT (user_id, date, metric)
    DO NOTHING;
  `, [date]);

  /**
	 * 2️⃣ Backfill blood pressure (systolic)
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
		DATE(measured_at) AS date,
		'blood_pressure_systolic' AS metric,
		AVG(systolic),
		MIN(systolic),
		MAX(systolic),
		COUNT(*),
		COUNT(*)
	  FROM blood_pressure_readings
	  WHERE DATE(measured_at) = $1
	  GROUP BY user_id, DATE(measured_at)
	  ON CONFLICT (user_id, date, metric)
	  DO NOTHING;
	`, [date]);

	/**
	 * 3️⃣ Backfill blood pressure (diastolic)
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
		DATE(measured_at) AS date,
		'blood_pressure_diastolic' AS metric,
		AVG(diastolic),
		MIN(diastolic),
		MAX(diastolic),
		COUNT(*),
		COUNT(*)
	  FROM blood_pressure_readings
	  WHERE DATE(measured_at) = $1
	  GROUP BY user_id, DATE(measured_at)
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
