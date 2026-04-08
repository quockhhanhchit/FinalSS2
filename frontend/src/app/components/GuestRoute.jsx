import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { isAuthenticated } from "../lib/auth";
import { resolveOnboardingStatus } from "../lib/onboarding";

export function GuestRoute() {
  const authenticated = isAuthenticated();
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadOnboardingStatus() {
      if (!authenticated) {
        return;
      }

      try {
        const completed = await resolveOnboardingStatus();

        if (!ignore) {
          setOnboardingCompleted(completed);
        }
      } catch {
        if (!ignore) {
          setOnboardingCompleted(false);
        }
      }
    }

    loadOnboardingStatus();

    return () => {
      ignore = true;
    };
  }, [authenticated]);

  if (!authenticated) {
    return <Outlet />;
  }

  if (onboardingCompleted === null) {
    return null;
  }

  return <Navigate to={onboardingCompleted ? "/app" : "/onboarding"} replace />;
}
