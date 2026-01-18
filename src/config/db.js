const { Pool } = require("pg");
const dns = require("dns");
require("dotenv").config();

// Force IPv4 (Render / Supabase safe)
dns.setDefaultResultOrder("ipv4first");

const isRemoteDb = Boolean(process.env.DATABASE_URL);

const pool = isRemoteDb
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false
    });

module.exports = pool;
