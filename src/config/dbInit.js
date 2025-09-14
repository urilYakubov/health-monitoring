// src/config/dbInit.js
const pool = require("./db");

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      doctor_email TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS health_data (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      metric_type TEXT NOT NULL,
      value NUMERIC NOT NULL,
      recorded_at TIMESTAMP DEFAULT NOW(),
      alert TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      metric_type TEXT,
      value NUMERIC,
      reason TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
	
	
	CREATE TABLE IF NOT EXISTS anomalies ( 
		id SERIAL PRIMARY KEY, 
		user_id INT REFERENCES users(id), 
		metric_type TEXT, 
		value NUMERIC, 
		avg NUMERIC, 
		std_dev NUMERIC, 
		z_score NUMERIC, 
		threshold NUMERIC, 
		created_at TIMESTAMP DEFAULT NOW() 
	);

    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_integrations (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      provider TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TIMESTAMP,
	  created_at TIMESTAMP DEFAULT NOW(),
	  updated_at TIMESTAMP
    );
  `);
}

module.exports = initDb;