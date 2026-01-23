const pool = require("../config/db");

exports.getDailySeries = async ({
  userId,
  metric,
  from,
  to
}) => {
  const { rows } = await pool.query(`
    SELECT date, avg_value
    FROM daily_metric_series
    WHERE user_id = $1
      AND metric = $2
      AND date BETWEEN $3 AND $4
    ORDER BY date ASC
  `, [userId, metric, from, to]);

  return rows.map(r => ({
    date: new Date(r.date),
    value: Number(r.avg_value)
  }));
};
