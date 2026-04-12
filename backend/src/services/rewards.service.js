const crypto = require("crypto");
const pool = require("../config/db");

const ACHIEVEMENT_RULES = [
  {
    type: "streak",
    level: 7,
    title: "7-Day Streak",
    description: "Completed 7 days in a row",
    points: 100,
  },
  {
    type: "streak",
    level: 14,
    title: "14-Day Streak",
    description: "Completed 14 days in a row",
    points: 200,
  },
  {
    type: "streak",
    level: 30,
    title: "30-Day Streak",
    description: "Completed 30 days in a row",
    points: 500,
  },
  {
    type: "weight",
    title: "First 1kg Lost",
    description: "Lost your first kilogram",
    points: 100,
  },
  {
    type: "weight",
    title: "5kg Milestone",
    description: "Lost 5 kilograms",
    points: 300,
  },
  {
    type: "budget",
    title: "Budget Master",
    description: "Stayed under budget",
    points: 150,
  },
  {
    type: "complete",
    title: "Week 1 Complete",
    description: "Finished first week",
    points: 150,
  },
  {
    type: "complete",
    title: "Week 2 Complete",
    description: "Finished second week",
    points: 250,
  },
  {
    type: "milestone",
    title: "Perfect Day",
    description: "100% completion on a day",
    points: 100,
  },
  {
    type: "special",
    title: "Fitness Champion",
    description: "Completed 20 workouts",
    points: 300,
  },
  {
    type: "special",
    title: "Hydration Hero",
    description: "Hit water goal 14 days",
    points: 200,
  },
];

function calculateStreak(dates) {
  const sorted = [...new Set(dates)]
    .sort()
    .map((date) => new Date(`${date}T00:00:00.000Z`));

  if (sorted.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const diffDays = Math.round(
      (sorted[index] - sorted[index - 1]) / (24 * 60 * 60 * 1000)
    );

    current = diffDays === 1 ? current + 1 : 1;
    best = Math.max(best, current);
  }

  return best;
}

async function getRewardMetrics(userId) {
  const [[profile]] = await pool.query(
    "SELECT budget_total FROM user_profiles WHERE user_id = ?",
    [userId]
  );
  const [weights] = await pool.query(
    "SELECT weight_kg FROM weight_logs WHERE user_id = ? ORDER BY log_date ASC",
    [userId]
  );
  const [[expensesRow]] = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) AS totalSpent FROM expense_logs WHERE user_id = ?",
    [userId]
  );
  const [completedDays] = await pool.query(
    `SELECT pd.plan_date
     FROM plans p
     JOIN plan_days pd ON pd.plan_id = p.id
     WHERE p.user_id = ? AND pd.completed = true
     ORDER BY pd.plan_date ASC`,
    [userId]
  );
  const [[taskRow]] = await pool.query(
    `SELECT
       COUNT(CASE WHEN dtc.task_type = 'workout' AND dtc.is_completed = true THEN 1 END) AS workoutsDone,
       COUNT(CASE WHEN dtc.task_type = 'water' AND dtc.is_completed = true THEN 1 END) AS waterDone
     FROM plans p
     JOIN plan_days pd ON pd.plan_id = p.id
     LEFT JOIN daily_task_completions dtc ON dtc.plan_day_id = pd.id
     WHERE p.user_id = ?`,
    [userId]
  );

  const firstWeight = weights.length ? Number(weights[0].weight_kg) : null;
  const latestWeight = weights.length
    ? Number(weights[weights.length - 1].weight_kg)
    : null;
  const weightLost =
    firstWeight !== null && latestWeight !== null
      ? Math.max(firstWeight - latestWeight, 0)
      : 0;

  return {
    bestStreak: calculateStreak(
      completedDays.map((day) => new Date(day.plan_date).toISOString().split("T")[0])
    ),
    daysCompleted: completedDays.length,
    weightLost,
    budgetTotal: Number(profile?.budget_total || 0),
    totalSpent: Number(expensesRow?.totalSpent || 0),
    workoutsDone: Number(taskRow?.workoutsDone || 0),
    waterDone: Number(taskRow?.waterDone || 0),
  };
}

function isAchievementEarned(rule, metrics) {
  if (rule.type === "streak") return metrics.bestStreak >= Number(rule.level || 0);
  if (rule.title === "First 1kg Lost") return metrics.weightLost >= 1;
  if (rule.title === "5kg Milestone") return metrics.weightLost >= 5;
  if (rule.title === "Budget Master") {
    return metrics.budgetTotal > 0 && metrics.totalSpent > 0 && metrics.totalSpent <= metrics.budgetTotal;
  }
  if (rule.title === "Week 1 Complete") return metrics.daysCompleted >= 7;
  if (rule.title === "Week 2 Complete") return metrics.daysCompleted >= 14;
  if (rule.title === "Perfect Day") return metrics.daysCompleted >= 1;
  if (rule.title === "Fitness Champion") return metrics.workoutsDone >= 20;
  if (rule.title === "Hydration Hero") return metrics.waterDone >= 14;

  return false;
}

async function syncAchievements(userId) {
  const metrics = await getRewardMetrics(userId);
  const achievements = [];

  for (const rule of ACHIEVEMENT_RULES) {
    const earned = isAchievementEarned(rule, metrics);
    const [existing] = await pool.query(
      "SELECT * FROM user_achievements WHERE user_id = ? AND title = ? LIMIT 1",
      [userId, rule.title]
    );
    const finalEarned = Boolean(existing[0]?.earned) || earned;

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO user_achievements
         (user_id, type, level, title, description, earned, points_awarded, earned_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          rule.type,
          rule.level || null,
          rule.title,
          rule.description,
          finalEarned,
          rule.points,
          finalEarned ? new Date() : null,
        ]
      );
    } else if (earned && !existing[0].earned) {
      await pool.query(
        `UPDATE user_achievements
         SET earned = true, points_awarded = ?, earned_at = COALESCE(earned_at, CURRENT_TIMESTAMP)
         WHERE id = ?`,
        [rule.points, existing[0].id]
      );
    }

    achievements.push({
      type: rule.type,
      level: rule.level || null,
      title: rule.title,
      description: rule.description,
      earned: finalEarned,
      points: rule.points,
    });
  }

  return achievements;
}

async function calculateAvailablePoints(userId) {
  const [[earnedRow]] = await pool.query(
    `SELECT COALESCE(SUM(points_awarded), 0) AS earnedPoints
     FROM user_achievements
     WHERE user_id = ? AND earned = true`,
    [userId]
  );
  const [[spentRow]] = await pool.query(
    `SELECT COALESCE(SUM(points_spent), 0) AS spentPoints
     FROM reward_redemptions
     WHERE user_id = ?`,
    [userId]
  );

  return Number(earnedRow.earnedPoints || 0) - Number(spentRow.spentPoints || 0);
}

async function getRewardsSummary(userId) {
  const achievements = await syncAchievements(userId);
  const totalPoints = await calculateAvailablePoints(userId);
  const currentLevel = Math.max(1, Math.floor(totalPoints / 500) + 1);
  const nextLevelPoints = currentLevel * 500;

  const [vouchers] = await pool.query(
    `SELECT rv.*,
       CASE WHEN rr.id IS NULL THEN false ELSE true END AS claimed
     FROM reward_vouchers rv
     LEFT JOIN reward_redemptions rr
       ON rr.voucher_id = rv.id AND rr.user_id = ?
     WHERE rv.is_active = true
     ORDER BY rv.points_required ASC, rv.id ASC`,
    [userId]
  );

  const [achievementHistory] = await pool.query(
    `SELECT title AS reward, earned_at AS date, points_awarded AS points, 'earned' AS type
     FROM user_achievements
     WHERE user_id = ? AND earned = true
     ORDER BY earned_at DESC
     LIMIT 5`,
    [userId]
  );
  const [redemptionHistory] = await pool.query(
    `SELECT CONCAT(rv.brand, ' ', rv.discount_label) AS reward,
            rr.redeemed_at AS date,
            -rr.points_spent AS points,
            'redeemed' AS type
     FROM reward_redemptions rr
     JOIN reward_vouchers rv ON rv.id = rr.voucher_id
     WHERE rr.user_id = ?
     ORDER BY rr.redeemed_at DESC
     LIMIT 5`,
    [userId]
  );

  const recentRewards = [...achievementHistory, ...redemptionHistory]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return {
    totalPoints,
    currentLevel,
    nextLevelPoints,
    achievements,
    vouchers: vouchers.map((voucher) => ({
      id: voucher.id,
      brand: voucher.brand,
      discount: voucher.discount_label,
      image: voucher.image_url,
      points: Number(voucher.points_required),
      available: Number(voucher.available_quantity),
      claimed: Boolean(voucher.claimed),
    })),
    recentRewards,
  };
}

async function redeemVoucher(userId, voucherId) {
  await syncAchievements(userId);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[voucher]] = await connection.query(
      `SELECT * FROM reward_vouchers
       WHERE id = ? AND is_active = true
       FOR UPDATE`,
      [voucherId]
    );

    if (!voucher) {
      const error = new Error("Voucher not found");
      error.status = 404;
      throw error;
    }

    if (Number(voucher.available_quantity) <= 0) {
      const error = new Error("Voucher is out of stock");
      error.status = 400;
      throw error;
    }

    const [[existing]] = await connection.query(
      "SELECT id FROM reward_redemptions WHERE user_id = ? AND voucher_id = ? LIMIT 1",
      [userId, voucherId]
    );

    if (existing) {
      const error = new Error("Voucher already claimed");
      error.status = 400;
      throw error;
    }

    const totalPoints = await calculateAvailablePoints(userId);

    if (totalPoints < Number(voucher.points_required)) {
      const error = new Error("Not enough points to redeem this voucher");
      error.status = 400;
      throw error;
    }

    const redeemCode = `BF-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    await connection.query(
      `INSERT INTO reward_redemptions
       (user_id, voucher_id, points_spent, redeem_code)
       VALUES (?, ?, ?, ?)`,
      [userId, voucherId, voucher.points_required, redeemCode]
    );
    await connection.query(
      `UPDATE reward_vouchers
       SET available_quantity = available_quantity - 1
       WHERE id = ?`,
      [voucherId]
    );

    await connection.commit();

    return {
      message: "Voucher redeemed successfully",
      redeemCode,
      summary: await getRewardsSummary(userId),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getRewardsSummary,
  redeemVoucher,
};
