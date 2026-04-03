const pool = require("../config/db");

async function saveProfile(userId, payload) {
  const {
    age,
    height,
    weight,
    goal,
    duration,
    budget,
    location,
    mealsPerDay,
    budgetStyle,
  } = payload;

  const [existing] = await pool.query(
    "SELECT id FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  if (existing.length > 0) {
    await pool.query(
      `UPDATE user_profiles
       SET age = ?, height_cm = ?, weight_kg = ?, goal_type = ?, duration_days = ?,
           budget_total = ?, workout_location = ?, meals_per_day = ?, budget_style = ?
       WHERE user_id = ?`,
      [
        age,
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
      (user_id, age, height_cm, weight_kg, goal_type, duration_days, budget_total, workout_location, meals_per_day, budget_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        age,
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

module.exports = {
  saveProfile,
  getProfile,
};