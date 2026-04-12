const pool = require("../config/db");

function toDateKey(value) {
  return new Date(value).toISOString().split("T")[0];
}

function calculateStreaks(completedDays) {
  const dates = [...new Set(completedDays.map((day) => toDateKey(day.plan_date)))]
    .sort()
    .map((date) => new Date(`${date}T00:00:00.000Z`));

  if (dates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  let bestStreak = 1;
  let currentRun = 1;

  for (let index = 1; index < dates.length; index += 1) {
    const diffDays = Math.round(
      (dates[index] - dates[index - 1]) / (24 * 60 * 60 * 1000)
    );

    if (diffDays === 1) {
      currentRun += 1;
    } else {
      currentRun = 1;
    }

    bestStreak = Math.max(bestStreak, currentRun);
  }

  return {
    currentStreak: currentRun,
    bestStreak,
  };
}

function buildAchievements({
  weights,
  expenses,
  daysCompleted,
  currentStreak,
  workoutsDoneThisWeek,
  totalSpent,
  budgetTotal,
}) {
  const achievements = [];

  if (weights.length > 0) {
    achievements.push({
      code: "W1",
      title: "First weight log",
      description: "You recorded your first weight entry.",
    });
  }

  if (expenses.length > 0) {
    achievements.push({
      code: "B1",
      title: "Budget tracker started",
      description: "You recorded your first expense.",
    });
  }

  if (daysCompleted > 0) {
    achievements.push({
      code: "D1",
      title: "First plan day done",
      description: `${daysCompleted} plan day${daysCompleted === 1 ? "" : "s"} completed.`,
    });
  }

  if (currentStreak >= 3) {
    achievements.push({
      code: "S3",
      title: "3-day streak",
      description: "You kept your routine going for 3 days.",
    });
  }

  if (workoutsDoneThisWeek > 0) {
    achievements.push({
      code: "GYM",
      title: "Workout momentum",
      description: `${workoutsDoneThisWeek} workout task${workoutsDoneThisWeek === 1 ? "" : "s"} done this week.`,
    });
  }

  if (budgetTotal > 0 && totalSpent <= budgetTotal) {
    achievements.push({
      code: "SAVE",
      title: "Within budget",
      description: "Your spending is still under the planned budget.",
    });
  }

  return achievements.slice(0, 3);
}

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
    `SELECT * FROM plans
     WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [userId]
  );

  const profile = profiles[0] || null;
  const profileWeight = profile ? Number(profile.weight_kg || 0) : null;
  const currentWeight = weights.length
    ? Number(weights[weights.length - 1].weight_kg)
    : profileWeight;
  const startWeight = weights.length ? Number(weights[0].weight_kg) : profileWeight;

  let goalWeight = null;
  if (profile && startWeight) {
    if (profile.goal_type === "gain") {
      goalWeight = startWeight + 5;
    } else if (profile.goal_type === "maintain") {
      goalWeight = startWeight;
    } else {
      goalWeight = startWeight - 5;
    }
  }

  let goalProgress = 0;
  if (profile && startWeight && currentWeight && goalWeight !== null) {
    if (profile.goal_type === "lose") {
      goalProgress = ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;
    } else if (profile.goal_type === "gain") {
      goalProgress = ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100;
    } else {
      goalProgress = 100;
    }
  }

  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  let daysCompleted = 0;
  let daysCompletedThisWeek = 0;
  let mealsLoggedThisWeek = 0;
  let workoutsDoneThisWeek = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  if (plans.length > 0) {
    const [planDays] = await pool.query(
      "SELECT COUNT(*) AS totalCompleted FROM plan_days WHERE plan_id = ? AND completed = true",
      [plans[0].id]
    );
    daysCompleted = planDays[0].totalCompleted;

    const [completedRows] = await pool.query(
      `SELECT plan_date
       FROM plan_days
       WHERE plan_id = ? AND completed = true
       ORDER BY plan_date ASC`,
      [plans[0].id]
    );
    const streaks = calculateStreaks(completedRows);
    currentStreak = streaks.currentStreak;
    bestStreak = streaks.bestStreak;

    const [weeklyRows] = await pool.query(
      `SELECT
         COUNT(DISTINCT CASE WHEN pd.completed = true THEN pd.id END) AS daysCompletedThisWeek,
         COUNT(CASE WHEN dtc.task_type = 'meal' AND dtc.is_completed = true THEN 1 END) AS mealsLoggedThisWeek,
         COUNT(CASE WHEN dtc.task_type = 'workout' AND dtc.is_completed = true THEN 1 END) AS workoutsDoneThisWeek
       FROM plan_days pd
       LEFT JOIN daily_task_completions dtc ON dtc.plan_day_id = pd.id
       WHERE pd.plan_id = ?
         AND YEARWEEK(pd.plan_date, 1) = YEARWEEK(CURDATE(), 1)`,
      [plans[0].id]
    );

    daysCompletedThisWeek = Number(weeklyRows[0]?.daysCompletedThisWeek || 0);
    mealsLoggedThisWeek = Number(weeklyRows[0]?.mealsLoggedThisWeek || 0);
    workoutsDoneThisWeek = Number(weeklyRows[0]?.workoutsDoneThisWeek || 0);
  }

  const budgetTotal = profile ? Number(profile.budget_total) : 0;
  const achievements = buildAchievements({
    weights,
    expenses,
    daysCompleted,
    currentStreak,
    workoutsDoneThisWeek,
    totalSpent,
    budgetTotal,
  });

  return {
    currentWeight,
    startWeight,
    goalWeight,
    goalType: profile?.goal_type || null,
    budgetTotal,
    totalSpent,
    goalProgress: Math.max(0, Math.min(100, Math.round(goalProgress))),
    daysCompleted,
    currentStreak,
    bestStreak,
    weeklyStats: {
      daysCompletedThisWeek,
      mealsLoggedThisWeek,
      workoutsDoneThisWeek,
    },
    achievements,
    weightLogs: weights,
    expenseLogs: expenses,
  };
}

module.exports = {
  getDashboardSummary,
};
