const pool = require("../config/db");
const {
  generateBudgetBreakdown,
  generatePlanDays,
} = require("../utils/plan-generator");

async function createPlanForUser(userId) {
  const [profiles] = await pool.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  if (profiles.length === 0) {
    throw new Error("Profile not found. Complete onboarding first.");
  }

  const profile = profiles[0];
  const startDate = new Date();
  const durationDays = profile.duration_days || 30;

  const budget = generateBudgetBreakdown(
    Number(profile.budget_total),
    profile.budget_style
  );

  const [planResult] = await pool.query(
    `INSERT INTO plans (user_id, duration_days, start_date, status)
     VALUES (?, ?, ?, 'active')`,
    [userId, durationDays, startDate.toISOString().split("T")[0]]
  );

  const planId = planResult.insertId;

  await pool.query(
    `INSERT INTO budget_breakdowns
     (plan_id, food_amount, workout_amount, wellness_amount, buffer_amount, total_budget, daily_budget)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      planId,
      budget.food,
      budget.workout,
      budget.wellness,
      budget.buffer,
      budget.totalBudget,
      budget.dailyBudget,
    ]
  );

  const planDays = generatePlanDays(startDate, durationDays, budget.dailyBudget);

  for (const day of planDays) {
    const [dayResult] = await pool.query(
      `INSERT INTO plan_days
       (plan_id, day_number, plan_date, workout_type, planned_calories, planned_cost, completed)
       VALUES (?, ?, ?, ?, ?, ?, false)`,
      [
        planId,
        day.dayNumber,
        day.planDate,
        day.workoutType,
        day.plannedCalories,
        day.plannedCost,
      ]
    );

    const planDayId = dayResult.insertId;

    for (const meal of day.meals) {
      await pool.query(
        `INSERT INTO meals (plan_day_id, meal_name, meal_time, calories, cost)
         VALUES (?, ?, ?, ?, ?)`,
        [planDayId, meal.mealName, meal.mealTime, meal.calories, meal.cost]
      );
    }

    for (const workout of day.workouts) {
      await pool.query(
        `INSERT INTO workouts (plan_day_id, workout_name, duration_minutes, description)
         VALUES (?, ?, ?, ?)`,
        [
          planDayId,
          workout.workoutName,
          workout.durationMinutes,
          workout.description,
        ]
      );
    }
  }

  return { planId, budget };
}

async function getCurrentPlan(userId) {
  const [plans] = await pool.query(
    `SELECT * FROM plans
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (plans.length === 0) return null;

  const plan = plans[0];

  const [days] = await pool.query(
    `SELECT * FROM plan_days WHERE plan_id = ? ORDER BY day_number ASC`,
    [plan.id]
  );

  return {
    ...plan,
    days,
  };
}

async function getPlanDay(userId, dayNumber) {
  const [plans] = await pool.query(
    `SELECT * FROM plans
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (plans.length === 0) {
    throw new Error("Plan not found");
  }

  const plan = plans[0];

  const [days] = await pool.query(
    `SELECT * FROM plan_days WHERE plan_id = ? AND day_number = ?`,
    [plan.id, dayNumber]
  );

  if (days.length === 0) {
    throw new Error("Plan day not found");
  }

  const day = days[0];

  const [meals] = await pool.query(
    "SELECT * FROM meals WHERE plan_day_id = ?",
    [day.id]
  );

  const [workouts] = await pool.query(
    "SELECT * FROM workouts WHERE plan_day_id = ?",
    [day.id]
  );

  return {
    ...day,
    meals,
    workouts,
    sleep: { target: "8 hours", time: "10:00 PM - 6:00 AM" },
    water: { target: "2.5 liters", glasses: 10 },
  };
}

module.exports = {
  createPlanForUser,
  getCurrentPlan,
  getPlanDay,
};