const pool = require("../config/db");

async function getCurrentBudget(userId) {
  const [plans] = await pool.query(
    `SELECT * FROM plans
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (plans.length === 0) return null;

  const [budgets] = await pool.query(
    "SELECT * FROM budget_breakdowns WHERE plan_id = ?",
    [plans[0].id]
  );

  return budgets[0] || null;
}

module.exports = {
  getCurrentBudget,
};