const pool = require("../config/db");

async function addWeightLog(userId, { date, weight, note }) {
  const [result] = await pool.query(
    "INSERT INTO weight_logs (user_id, log_date, weight_kg, note) VALUES (?, ?, ?, ?)",
    [userId, date, weight, note || null]
  );

  return { id: result.insertId, date, weight, note };
}

async function getWeightLogs(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM weight_logs WHERE user_id = ? ORDER BY log_date DESC",
    [userId]
  );

  return rows;
}

async function addExpenseLog(userId, { date, category, amount, description }) {
  const [result] = await pool.query(
    "INSERT INTO expense_logs (user_id, log_date, category, amount, description) VALUES (?, ?, ?, ?, ?)",
    [userId, date, category, amount, description || null]
  );

  return { id: result.insertId, date, category, amount, description };
}

async function getExpenseLogs(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM expense_logs WHERE user_id = ? ORDER BY log_date DESC, created_at DESC",
    [userId]
  );

  return rows;
}

module.exports = {
  addWeightLog,
  getWeightLogs,
  addExpenseLog,
  getExpenseLogs,
};