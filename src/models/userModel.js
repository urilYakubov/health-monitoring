const pool = require('../config/db');

async function findUserByEmail(email) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

async function createUser(email, hashedPassword, firstName, lastName) {
  const res = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, first_name, last_name`,
    [email, hashedPassword, firstName, lastName]
  );
  return res.rows[0];
}

async function findUserById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

async function getAllUsers() {
  const result = await pool.query(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      role
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows;
}

async function updateUserRole(userId, role) {
  const result = await pool.query(
    `
    UPDATE users
    SET role = $1
    WHERE id = $2
    RETURNING *
    `,
    [role, userId]
  );

  return result.rows[0];
}


module.exports = { findUserByEmail, createUser, findUserById, getAllUsers, updateUserRole };
