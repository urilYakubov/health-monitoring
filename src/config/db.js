const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 (Render doesn’t support IPv6)
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch((err) => console.error('❌ Connection error', err));

module.exports = pool;