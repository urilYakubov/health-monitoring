const pool = require("./db");

async function initDb() {
  try {
    // Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        doctor_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Metrics
    await pool.query(`
      CREATE TABLE IF NOT EXISTS health_data (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL,
        value NUMERIC NOT NULL,
        recorded_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Alerts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL,
        value NUMERIC NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Feedback
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Integrations (Fitbit, Withings, etc.)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_integrations (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ All tables created or already exist");
    process.exit(0);
  } catch (err) {
    console.error("❌ DB init error:", err);
    process.exit(1);
  }
}

initDb();