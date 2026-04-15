const pool = require("../config/db");

function buildLogQueryOptions({ period = "all", page = 1, limit = 10 } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const offset = (safePage - 1) * safeLimit;
  const filters = [];

  if (period === "week") {
    filters.push("log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
  } else if (period === "month") {
    filters.push("YEAR(log_date) = YEAR(CURDATE()) AND MONTH(log_date) = MONTH(CURDATE())");
  }

  return {
    page: safePage,
    limit: safeLimit,
    offset,
    filterSql: filters.length ? ` AND ${filters.join(" AND ")}` : "",
  };
}

function paginatedResponse(items, countRows, page, limit) {
  const total = Number(countRows[0]?.total || 0);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

async function addWeightLog(userId, { date, weight, note }) {
  const [result] = await pool.query(
    "INSERT INTO weight_logs (user_id, log_date, weight_kg, note) VALUES (?, ?, ?, ?)",
    [userId, date, weight, note || null]
  );

  return { id: result.insertId, date, weight, note };
}

async function getWeightLogs(userId, query = {}) {
  const { page, limit, offset, filterSql } = buildLogQueryOptions(query);
  const [rows] = await pool.query(
    `SELECT * FROM weight_logs
     WHERE user_id = ?${filterSql}
     ORDER BY log_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM weight_logs
     WHERE user_id = ?${filterSql}`,
    [userId]
  );

  return paginatedResponse(rows, countRows, page, limit);
}

async function updateWeightLog(userId, logId, { date, weight, note }) {
  const [result] = await pool.query(
    `UPDATE weight_logs
     SET log_date = ?, weight_kg = ?, note = ?
     WHERE id = ? AND user_id = ?`,
    [date, weight, note || null, logId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Weight log not found");
  }

  return { id: Number(logId), date, weight, note: note || "" };
}

async function deleteWeightLog(userId, logId) {
  const [result] = await pool.query(
    "DELETE FROM weight_logs WHERE id = ? AND user_id = ?",
    [logId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Weight log not found");
  }

  return { id: Number(logId) };
}

async function addExpenseLog(userId, { date, amount, description }) {
  const [result] = await pool.query(
    "INSERT INTO expense_logs (user_id, log_date, category, amount, description) VALUES (?, ?, ?, ?, ?)",
    [userId, date, "Food", amount, description || null]
  );

  return { id: result.insertId, date, category: "Food", amount, description };
}

async function getExpenseLogs(userId, query = {}) {
  const { page, limit, offset, filterSql } = buildLogQueryOptions(query);
  const [rows] = await pool.query(
    `SELECT * FROM expense_logs
     WHERE user_id = ?${filterSql}
     ORDER BY log_date DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM expense_logs
     WHERE user_id = ?${filterSql}`,
    [userId]
  );

  return paginatedResponse(rows, countRows, page, limit);
}

async function updateExpenseLog(userId, logId, { date, amount, description }) {
  const [result] = await pool.query(
    `UPDATE expense_logs
     SET log_date = ?, category = ?, amount = ?, description = ?
     WHERE id = ? AND user_id = ?`,
    [date, "Food", amount, description || null, logId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Expense log not found");
  }

  return {
    id: Number(logId),
    date,
    category: "Food",
    amount,
    description: description || "",
  };
}

async function deleteExpenseLog(userId, logId) {
  const [result] = await pool.query(
    "DELETE FROM expense_logs WHERE id = ? AND user_id = ?",
    [logId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Expense log not found");
  }

  return { id: Number(logId) };
}

module.exports = {
  addWeightLog,
  getWeightLogs,
  updateWeightLog,
  deleteWeightLog,
  addExpenseLog,
  getExpenseLogs,
  updateExpenseLog,
  deleteExpenseLog,
};
