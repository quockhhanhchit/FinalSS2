import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { isAuthenticated } from "../lib/auth";
import { resolveOnboardingStatus } from "../lib/onboarding";

export function ProtectedRoute() {
  const location = useLocation();
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
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (onboardingCompleted === null) {
    return null;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
