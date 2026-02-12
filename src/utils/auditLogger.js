const pool = require("../config/db");

async function logAudit({
  userId,
  action,
  entity = null,
  entityId = null,
  details = {}
}) {
  try {
    await pool.query(
      `
      INSERT INTO audit_log 
      (user_id, action, entity, entity_id, details)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [userId, action, entity, entityId, details]
    );
  } catch (err) {
    console.error("Audit logging failed:", err.message);
  }
}

module.exports = { logAudit };
