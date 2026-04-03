import { Navigate, Outlet } from "react-router";
import { isAuthenticated } from "../lib/auth";

export function GuestRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}