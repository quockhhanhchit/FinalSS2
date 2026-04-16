const pool = require("../config/db");
const planService = require("./plan.service");

async function saveProfile(userId, payload) {
  const {
    age,
    gender = "male",
    height,
    weight,
    goal,
    duration,
    budget,
    location,
    mealsPerDay,
    budgetStyle,
  } = payload;

  if (Number(budget) < 3000000) {
    throw new Error("Minimum budget is 3,000,000 VND");
  }

  const [existing] = await pool.query(
    "SELECT id FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  if (existing.length > 0) {
    await pool.query(
      `UPDATE user_profiles
       SET age = ?, gender = ?, height_cm = ?, weight_kg = ?, goal_type = ?, duration_days = ?,
           budget_total = ?, workout_location = ?, meals_per_day = ?, budget_style = ?
       WHERE user_id = ?`,
      [
        age,
        gender,
        height,
        weight,
        goal,
        duration,
        budget,
        location,
        mealsPerDay,
        budgetStyle,
        userId,
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO user_profiles
      (user_id, age, gender, height_cm, weight_kg, goal_type, duration_days, budget_total, workout_location, meals_per_day, budget_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        age,
        gender,
        height,
        weight,
        goal,
        duration,
        budget,
        location,
        mealsPerDay,
        budgetStyle,
      ]
    );
  }

  const [rows] = await pool.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  return rows[0];
}

async function getProfile(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  return rows[0] || null;
}

async function updateBodyGoals(userId, payload) {
  const current = await getProfile(userId);

  if (!current) {
    throw new Error("Profile not found. Complete onboarding first.");
  }

  const profile = await saveProfile(userId, {
    age: payload.age,
    gender: payload.gender,
    height: payload.height,
    weight: payload.weight,
    goal: payload.goal,
    duration: payload.duration,
    budget: current.budget_total,
    location: current.workout_location,
    mealsPerDay: current.meals_per_day,
    budgetStyle: current.budget_style,
  });

  await planService.syncActivePlanBudgetForUser(userId);

  return profile;
}

async function updateBudgetPreferences(userId, payload) {
  const current = await getProfile(userId);

  if (!current) {
    throw new Error("Profile not found. Complete onboarding first.");
  }

  const profile = await saveProfile(userId, {
    age: current.age,
    gender: current.gender || "male",
    height: current.height_cm,
    weight: current.weight_kg,
    goal: current.goal_type,
    duration: current.duration_days,
    budget: payload.budget,
    location: payload.location,
    mealsPerDay: payload.mealsPerDay,
    budgetStyle: payload.budgetStyle,
  });

  await planService.syncActivePlanBudgetForUser(userId);

  return profile;
}

async function getNotificationSettings(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM user_notification_settings WHERE user_id = ?",
    [userId]
  );

  if (rows.length > 0) {
    return rows[0];
  }

  await pool.query(
    "INSERT INTO user_notification_settings (user_id) VALUES (?)",
    [userId]
  );

  const [nextRows] = await pool.query(
    "SELECT * FROM user_notification_settings WHERE user_id = ?",
    [userId]
  );

  return nextRows[0];
}

async function updateNotificationSettings(userId, payload) {
  await pool.query(
    `INSERT INTO user_notification_settings
     (user_id, daily_reminders, weight_tracking_reminders, budget_alerts)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       daily_reminders = VALUES(daily_reminders),
       weight_tracking_reminders = VALUES(weight_tracking_reminders),
       budget_alerts = VALUES(budget_alerts)`,
    [
      userId,
      Boolean(payload.dailyReminders),
      Boolean(payload.weightTrackingReminders),
      Boolean(payload.budgetAlerts),
    ]
  );

  return getNotificationSettings(userId);
}

module.exports = {
  saveProfile,
  getProfile,
  updateBodyGoals,
  updateBudgetPreferences,
  getNotificationSettings,
  updateNotificationSettings,
};
