import { getAuthSession, setAuthSession } from "./auth";
import { apiGet } from "./api";

function hasPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

export function isOnboardingComplete(profile) {
  if (!profile) {
    return false;
  }

  return (
    hasPositiveNumber(profile.age) &&
    hasPositiveNumber(profile.height_cm) &&
    hasPositiveNumber(profile.weight_kg)
  );
}

export function getCachedOnboardingStatus() {
  const session = getAuthSession();

  if (typeof session?.onboardingCompleted === "boolean") {
    return session.onboardingCompleted;
  }

  return null;
}

export function setCachedOnboardingStatus(onboardingCompleted) {
  const session = getAuthSession() || {};

  setAuthSession({
    ...session,
    onboardingCompleted,
  });
}

export async function fetchOnboardingStatus() {
  const profile = await apiGet("/api/profile");
  const onboardingCompleted = isOnboardingComplete(profile);

  setCachedOnboardingStatus(onboardingCompleted);

  return onboardingCompleted;
}

export async function resolveOnboardingStatus(options = {}) {
  const { force = false } = options;
  const cachedStatus = getCachedOnboardingStatus();

  if (!force && typeof cachedStatus === "boolean") {
    return cachedStatus;
  }

  return fetchOnboardingStatus();
}
