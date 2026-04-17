const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/db");
const { getSmtpConfig, sendPasswordResetEmail } = require("./email.service");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildPasswordResetUrl(token) {
  const appUrl = (process.env.APP_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

async function persistRefreshToken(userId, refreshToken) {
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await pool.query(
    "UPDATE users SET refresh_token_hash = ? WHERE id = ?",
    [refreshTokenHash, userId]
  );
}

async function verifyGoogleIdToken(idToken) {
  const query = new URLSearchParams({ id_token: idToken });
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?${query.toString()}`
  );

  if (!response.ok) {
    const error = new Error("Invalid Google token");
    error.status = 401;
    throw error;
  }

  const payload = await response.json();

  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    const error = new Error("Google client ID mismatch");
    error.status = 401;
    throw error;
  }

  if (payload.email_verified !== "true") {
    const error = new Error("Google email is not verified");
    error.status = 401;
    throw error;
  }

  return payload;
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
  if (!user.password_hash) {
    const error = new Error("This account uses Google Sign-In");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return buildAuthPayload(user);
}

async function loginWithGoogle({ idToken }) {
  if (!idToken) {
    const error = new Error("Google ID token is required");
    error.status = 400;
    throw error;
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error("Google Sign-In is not configured");
    error.status = 500;
    throw error;
  }

  const payload = await verifyGoogleIdToken(idToken);
  const googleId = payload.sub;
  const email = String(payload.email || "").toLowerCase();
  const fullName = payload.name || email.split("@")[0] || "Google User";

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE google_id = ? OR email = ? LIMIT 1",
    [googleId, email]
  );

  let user = rows[0];

  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, auth_provider, google_id)
       VALUES (?, ?, ?, 'google', ?)`,
      [fullName, email, passwordHash, googleId]
    );

    user = {
      id: result.insertId,
      full_name: fullName,
      email,
    };
  } else {
    if (!user.google_id) {
      await pool.query(
        "UPDATE users SET google_id = ?, auth_provider = 'google' WHERE id = ?",
        [googleId, user.id]
      );
    }

    user = {
      ...user,
      full_name: user.full_name || fullName,
      email: user.email || email,
    };
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

async function changePassword(userId, { currentPassword, newPassword }) {
  const [rows] = await pool.query(
    "SELECT id, password_hash FROM users WHERE id = ?",
    [userId]
  );

  if (rows.length === 0) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isMatch) {
    const error = new Error("Current password is incorrect");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE users SET password_hash = ?, refresh_token_hash = NULL WHERE id = ?",
    [passwordHash, userId]
  );

  return { message: "Password changed successfully" };
}

async function requestPasswordReset(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    const error = new Error("Email is required");
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  // Always return a generic success response to avoid exposing account existence.
  if (rows.length === 0) {
    return {
      message:
        "If an account exists for this email, password reset instructions have been prepared.",
    };
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await pool.query(
    `UPDATE users
     SET password_reset_token_hash = ?, password_reset_expires_at = ?
     WHERE id = ?`,
    [resetTokenHash, expiresAt, rows[0].id]
  );

  const resetUrl = buildPasswordResetUrl(resetToken);

  try {
    await sendPasswordResetEmail({
      to: normalizedEmail,
      resetUrl,
      expiresInMinutes: PASSWORD_RESET_TOKEN_TTL_MINUTES,
    });
  } catch (error) {
    await pool.query(
      `UPDATE users
       SET password_reset_token_hash = NULL, password_reset_expires_at = NULL
       WHERE id = ?`,
      [rows[0].id]
    );

    if (error.code === "SMTP_NOT_CONFIGURED") {
      return {
        message:
          "If an account exists for this email, password reset instructions have been prepared.",
        ...(process.env.NODE_ENV === "production"
          ? {}
          : { resetUrl }),
      };
    }

    const smtpError = new Error("Unable to send password reset email right now");
    smtpError.status = 500;
    throw smtpError;
  }

  return {
    message:
      "If an account exists for this email, password reset instructions have been prepared.",
    ...(process.env.NODE_ENV === "production" || getSmtpConfig()
      ? {}
      : { resetUrl }),
  };
}

async function validatePasswordResetToken(token) {
  const normalizedToken = String(token || "").trim();

  if (!normalizedToken) {
    const error = new Error("Reset token is required");
    error.status = 400;
    throw error;
  }

  const tokenHash = hashToken(normalizedToken);

  const [rows] = await pool.query(
    `SELECT id
     FROM users
     WHERE password_reset_token_hash = ?
       AND password_reset_expires_at IS NOT NULL
       AND password_reset_expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (rows.length === 0) {
    const error = new Error("Reset link is invalid or has expired");
    error.status = 400;
    throw error;
  }

  return { valid: true };
}

async function resetPassword({ token, newPassword }) {
  const normalizedToken = String(token || "").trim();

  if (!normalizedToken) {
    const error = new Error("Reset token is required");
    error.status = 400;
    throw error;
  }

  const tokenHash = hashToken(normalizedToken);

  const [rows] = await pool.query(
    `SELECT id
     FROM users
     WHERE password_reset_token_hash = ?
       AND password_reset_expires_at IS NOT NULL
       AND password_reset_expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (rows.length === 0) {
    const error = new Error("Reset link is invalid or has expired");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    `UPDATE users
     SET password_hash = ?,
         refresh_token_hash = NULL,
         password_reset_token_hash = NULL,
         password_reset_expires_at = NULL
     WHERE id = ?`,
    [passwordHash, rows[0].id]
  );

  return { message: "Password reset successfully" };
}

module.exports = {
  register,
  login,
  loginWithGoogle,
  getMe,
  refreshAccessToken,
  logout,
  changePassword,
  requestPasswordReset,
  validatePasswordResetToken,
  resetPassword,
};
