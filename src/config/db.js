const { Pool } = require("pg");
const dns = require("dns");
require("dotenv").config();

// Force IPv4 (Render doesn’t support IPv6)
dns.setDefaultResultOrder("ipv4first");

/**
 * IMPORTANT:
 * Do NOT call pool.connect() here.
 * pg will manage connections automatically.
 * This prevents Jest from hanging.
 */

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, // must already be a string
      database: process.env.DB_NAME,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false
    });

module.exports = pool;
