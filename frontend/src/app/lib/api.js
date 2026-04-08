import {
  clearAuthSession,
  getAuthSession,
  getAuthToken,
  getRefreshToken,
  setAuthSession,
} from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

let refreshPromise = null;

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error("Session expired");
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new Error(payload?.message || "Session expired");
    }

    const currentSession = getAuthSession() || {};

    setAuthSession({
      ...currentSession,
      token: payload.token,
      refreshToken: payload.refreshToken,
      user: payload.user,
      name: payload.user?.fullName,
      email: payload.user?.email,
    });

    return payload.token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await parseResponse(response);

  if (
    response.status === 401 &&
    !options._retry &&
    path !== "/api/auth/refresh" &&
    path !== "/api/auth/login" &&
    path !== "/api/auth/register" &&
    path !== "/api/auth/google"
  ) {
    try {
      const nextToken = await refreshAccessToken();
      const retryHeaders = new Headers(options.headers || {});

      if (!retryHeaders.has("Content-Type") && options.body) {
        retryHeaders.set("Content-Type", "application/json");
      }

      retryHeaders.set("Authorization", `Bearer ${nextToken}`);

      return request(path, {
        ...options,
        headers: retryHeaders,
        _retry: true,
      });
    } catch (refreshError) {
      clearAuthSession();
      throw refreshError;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload?.message
        ? payload.message
        : "Request failed";

    throw new Error(message);
  }

  return payload;
}

export function apiGet(path) {
  return request(path);
}

export function apiPost(path, data) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function apiPut(path, data) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
