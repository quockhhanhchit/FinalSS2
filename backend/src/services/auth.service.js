const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { signToken } = require("../utils/jwt");

async function register({ fullName, email, password }) {
  const [existing] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
    [fullName, email, passwordHash]
  );

  const token = signToken({ id: result.insertId, email });

  return {
    token,
    user: {
      id: result.insertId,
      fullName,
      email,
    },
  };
}

async function login({ email, password }) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = signToken({ id: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
    },
  };
}

async function getMe(userId) {
  const [rows] = await pool.query(
    "SELECT id, full_name, email, created_at FROM users WHERE id = ?",
    [userId]
  );

  return rows[0] || null;
}

module.exports = {
  register,
  login,
  getMe,
};