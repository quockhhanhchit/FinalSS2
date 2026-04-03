const AUTH_STORAGE_KEY = "budgetfit_auth";

export function getAuthSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const session = getAuthSession();
  return Boolean(session?.token);
}

export function setAuthSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAuthToken() {
  return getAuthSession()?.token || null;
}
