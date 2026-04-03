import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { Dashboard } from "./screens/Dashboard";
import { Plan } from "./screens/Plan";
import { Tracking } from "./screens/Tracking";
import { Rewards } from "./screens/Rewards";
import { Settings } from "./screens/Settings";
import { Onboarding } from "./screens/Onboarding";
import { DailyRoutine } from "./screens/DailyRoutine";
import { BudgetBreakdown } from "./screens/BudgetBreakdown";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GuestRoute } from "./components/GuestRoute";

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "plan",
            element: <Plan />,
          },
          {
            path: "plan/day/:dayId",
            element: <DailyRoutine />,
          },
          {
            path: "tracking",
            element: <Tracking />,
          },
          {
            path: "rewards",
            element: <Rewards />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
          {
            path: "daily-routine",
            element: <DailyRoutine />,
          },
          {
            path: "budget-breakdown",
            element: <BudgetBreakdown />,
          },
        ],
      },
    ],
  },
]);