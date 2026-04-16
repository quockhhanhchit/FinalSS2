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
      title: "Ghi nhận cân nặng đầu tiên",
      description: "Bạn đã ghi lại chỉ số cân nặng đầu tiên.",
    });
  }

  if (expenses.length > 0) {
    achievements.push({
      code: "B1",
      title: "Bắt đầu theo dõi chi tiêu",
      description: "Bạn đã ghi lại khoản chi đầu tiên.",
    });
  }

  if (daysCompleted > 0) {
    achievements.push({
      code: "D1",
      title: "Hoàn thành ngày đầu tiên",
      description: `Bạn đã hoàn thành ${daysCompleted} ngày trong kế hoạch.`,
    });
  }

  if (currentStreak >= 3) {
    achievements.push({
      code: "S3",
      title: "Chuỗi 3 ngày",
      description: "Bạn đã duy trì lịch trình liên tục trong 3 ngày.",
    });
  }

  if (workoutsDoneThisWeek > 0) {
    achievements.push({
      code: "GYM",
      title: "Đà tập luyện tốt",
      description: `Bạn đã hoàn thành ${workoutsDoneThisWeek} nhiệm vụ tập luyện trong tuần này.`,
    });
  }

  if (budgetTotal > 0 && totalSpent <= budgetTotal) {
    achievements.push({
      code: "SAVE",
      title: "Chi tiêu trong ngân sách",
      description: "Chi tiêu của bạn vẫn nằm trong ngân sách đã đặt.",
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

  const spendingLogs = [
    ...expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount || 0),
      source: "tracking-expense",
    })),
  ].sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  const totalSpent = spendingLogs.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
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
  const [badges] = await pool.query(
    `SELECT badge_name, earned_at
     FROM user_badges
     WHERE user_id = ?
     ORDER BY earned_at DESC`,
    [userId]
  );

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
    badges,
    weightLogs: weights,
    expenseLogs: expenses,
    spendingLogs,
  };
}

async function getDashboardAnalytics(userId) {
  const [plans] = await pool.query(
    `SELECT * FROM plans
     WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [userId]
  );

  if (plans.length === 0) {
    return {
      budget_summary: {
        total_budget: 0,
        planned_cost_so_far: 0,
        actual_cost_so_far: 0,
        remaining_budget: 0,
      },
      routine_summary: {
        total_days: 0,
        completed_days: 0,
        skipped_days: 0,
      },
      chart_data: [],
      badges: [],
    };
  }

  const plan = plans[0];
  const [[budget]] = await pool.query(
    "SELECT * FROM budget_breakdowns WHERE plan_id = ? LIMIT 1",
    [plan.id]
  );
  const [[summary]] = await pool.query(
    `SELECT
       COUNT(*) AS totalDays,
       COUNT(CASE WHEN completed = true THEN 1 END) AS completedDays,
       COUNT(CASE WHEN completed = false AND plan_date < CURDATE() THEN 1 END) AS skippedDays,
       COALESCE(SUM(CASE WHEN plan_date <= CURDATE() THEN planned_cost ELSE 0 END), 0) AS plannedCostSoFar,
       COALESCE(SUM(actual_cost), 0) AS actualCostSoFar
     FROM plan_days
     WHERE plan_id = ?`,
    [plan.id]
  );
  const [chartRows] = await pool.query(
    `SELECT day_number, planned_cost, actual_cost
     FROM plan_days
     WHERE plan_id = ? AND completed = true
     ORDER BY plan_date DESC, day_number DESC
     LIMIT 7`,
    [plan.id]
  );
  const [badges] = await pool.query(
    `SELECT badge_name, earned_at
     FROM user_badges
     WHERE user_id = ?
     ORDER BY earned_at DESC`,
    [userId]
  );

  const totalBudget = Number(budget?.total_budget || 0);
  const actualCostSoFar = Number(summary?.actualCostSoFar || 0);

  return {
    budget_summary: {
      total_budget: totalBudget,
      planned_cost_so_far: Number(summary?.plannedCostSoFar || 0),
      actual_cost_so_far: actualCostSoFar,
      remaining_budget: Math.max(totalBudget - actualCostSoFar, 0),
    },
    routine_summary: {
      total_days: Number(summary?.totalDays || 0),
      completed_days: Number(summary?.completedDays || 0),
      skipped_days: Number(summary?.skippedDays || 0),
    },
    chart_data: chartRows
      .reverse()
      .map((row) => ({
        day: Number(row.day_number),
        planned_cost: Number(row.planned_cost || 0),
        actual_cost: row.actual_cost === null ? null : Number(row.actual_cost),
      })),
    badges,
  };
}

module.exports = {
  getDashboardSummary,
  getDashboardAnalytics,
};
