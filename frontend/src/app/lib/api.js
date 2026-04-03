import { clearAuthSession, getAuthToken } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

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

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

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
