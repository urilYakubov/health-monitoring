const { Pool } = require('pg');
const dns = require('dns').promises;
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

// Force IPv4 DNS resolution before first connection
(async () => {
  try {
    const ipv4 = (await dns.lookup(process.env.DB_HOST, { family: 4 })).address;
    pool.options.host = ipv4;
    await pool.connect();
    console.log('✅ Connected to PostgreSQL via IPv4');
  } catch (err) {
    console.error('❌ Connection error', err);
  }
})();

module.exports = pool;