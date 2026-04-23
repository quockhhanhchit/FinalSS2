const pool = require("../config/db");
const planService = require("./plan.service");

async function getCurrentBudget(userId) {
  const [plans] = await pool.query(
    `SELECT * FROM plans
     WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC, id DESC
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

async function updateCurrentBudget(userId, totalBudget) {
  const [profiles] = await pool.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  if (profiles.length === 0) {
    throw new Error("Profile not found. Complete onboarding first.");
  }

  await pool.query(
    `UPDATE user_profiles
     SET budget_total = ?
     WHERE user_id = ?`,
    [Number(totalBudget), userId]
  );

  await planService.syncActivePlanBudgetForUser(userId);

  return getCurrentBudget(userId);
}

module.exports = {
  getCurrentBudget,
  updateCurrentBudget,
};
