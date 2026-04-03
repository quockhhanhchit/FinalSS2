const pool = require("../config/db");

async function getDashboardSummary(userId) {
  const [profiles] = await pool.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  const [weights] = await pool.query(
    "SELECT * FROM weight_logs WHERE user_id = ? ORDER BY log_date ASC",
    [userId]
  );

  const [expenses] = await pool.query(
    "SELECT * FROM expense_logs WHERE user_id = ? ORDER BY log_date ASC",
    [userId]
  );

  const [plans] = await pool.query(
    "SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [userId]
  );

  const profile = profiles[0] || null;
  const currentWeight = weights.length ? Number(weights[weights.length - 1].weight_kg) : null;
  const startWeight = weights.length ? Number(weights[0].weight_kg) : null;

  let goalProgress = 0;
  if (profile && startWeight && currentWeight) {
    if (profile.goal_type === "lose") {
      const goalWeight = startWeight - 5;
      goalProgress = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;
    } else if (profile.goal_type === "gain") {
      const goalWeight = startWeight + 5;
      goalProgress = ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100;
    }
  }

  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  let daysCompleted = 0;
  if (plans.length > 0) {
    const [planDays] = await pool.query(
      "SELECT COUNT(*) AS totalCompleted FROM plan_days WHERE plan_id = ? AND completed = true",
      [plans[0].id]
    );
    daysCompleted = planDays[0].totalCompleted;
  }

  return {
    currentWeight,
    startWeight,
    goalType: profile?.goal_type || null,
    budgetTotal: profile ? Number(profile.budget_total) : 0,
    totalSpent,
    goalProgress: Math.round(goalProgress),
    daysCompleted,
    weightLogs: weights,
    expenseLogs: expenses,
  };
}

module.exports = {
  getDashboardSummary,
};