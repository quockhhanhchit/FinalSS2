const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

async function persistRefreshToken(userId, refreshToken) {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await pool.query(
    "UPDATE users SET refresh_token_hash = ? WHERE id = ?",
    [refreshTokenHash, userId]
  );
}

async function buildAuthPayload(user) {
  const tokenPayload = { id: user.id, email: user.email };
  const token = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  await persistRefreshToken(user.id, refreshToken);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
    },
  };
}

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

  return buildAuthPayload({
    id: result.insertId,
    full_name: fullName,
    email,
  });
}

async function login({ email, password }) {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (rows.length === 0) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return buildAuthPayload(user);
}

async function getMe(userId) {
  const [rows] = await pool.query(
    "SELECT id, full_name, email, created_at FROM users WHERE id = ?",
    [userId]
  );

  return rows[0] || null;
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token is required");
    error.status = 400;
    throw error;
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error("Invalid or expired refresh token");
    error.status = 401;
    throw error;
  }

  const [rows] = await pool.query(
    "SELECT id, full_name, email, refresh_token_hash FROM users WHERE id = ?",
    [decoded.id]
  );

  if (rows.length === 0 || !rows[0].refresh_token_hash) {
    const error = new Error("Refresh token is no longer valid");
    error.status = 401;
    throw error;
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(refreshToken, user.refresh_token_hash);

  if (!isMatch) {
    const error = new Error("Refresh token is no longer valid");
    error.status = 401;
    throw error;
  }

  return buildAuthPayload(user);
}

async function logout(userId) {
  await pool.query(
    "UPDATE users SET refresh_token_hash = NULL WHERE id = ?",
    [userId]
  );

  return { message: "Logged out successfully" };
}

module.exports = {
  register,
  login,
  getMe,
  refreshAccessToken,
  logout,
};
