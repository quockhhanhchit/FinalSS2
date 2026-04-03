import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Calendar as CalendarIcon,
  List,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { apiGet } from "../lib/api";

export function Plan() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("calendar");
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadPlan() {
      try {
        const data = await apiGet("/api/plans/current");

        if (!ignore) {
          setPlan(data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadPlan();

    return () => {
      ignore = true;
    };
  }, []);

  const planDays = useMemo(
    () =>
      (plan?.days || []).map((day) => ({
        day: day.day_number,
        date: new Date(day.plan_date),
        workout: day.workout_type,
        plannedCost: Number(day.planned_cost),
        completed: Boolean(day.completed),
      })),
    [plan],
  );

  const completedDays = planDays.filter((day) => day.completed).length;

  const getWorkoutColor = (workout) => {
    switch (workout) {
      case "Rest":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Cardio":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Strength":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "HIIT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">30-Day Plan</h1>
          <p className="text-muted-foreground">
            Your personalized routine for the next 30 days
          </p>
        </div>
        <div className="flex gap-2 bg-secondary rounded-lg p-1">
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Days Completed</div>
          <div className="text-2xl font-bold">
            {completedDays} / {planDays.length || 30}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {planDays.length
              ? `${Math.round((completedDays / planDays.length) * 100)}% complete`
              : "No plan yet"}
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
          <div className="text-2xl font-bold">{completedDays} days</div>
          <div className="text-xs text-primary mt-1">Data from backend</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Avg. Daily Cost</div>
          <div className="text-2xl font-bold">
            {planDays.length
              ? `${Math.round(planDays.reduce((sum, day) => sum + day.plannedCost, 0) / planDays.length / 1000)}k`
              : "0k"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">VND per day</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Budget Status</div>
          <div className="text-2xl font-bold text-primary">{plan ? "Active" : "Pending"}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {plan?.status || "Create a plan in onboarding"}
          </div>
        </div>
      </div>

      {viewMode === "calendar" && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {planDays[0]?.date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              }) || "Current Plan"}
            </h3>
          </div>
          <div className="grid grid-cols-7 gap-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground pb-2"
              >
                {day}
              </div>
            ))}

            {planDays.map((day) => (
              <button
                key={day.day}
                onClick={() => navigate(`/app/plan/day/${day.day}`)}
                className={`relative p-3 rounded-xl border transition-all hover:shadow-md ${
                  day.completed
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Day {day.day}</span>
                  {day.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-md border ${getWorkoutColor(
                    day.workout,
                  )}`}
                >
                  {day.workout}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {Math.round(day.plannedCost / 1000)}k VND
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3">
          {planDays.map((day) => (
            <button
              key={day.day}
              onClick={() => navigate(`/app/plan/day/${day.day}`)}
              className="w-full bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {day.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-semibold">Day {day.day}</div>
                      <div className="text-sm text-muted-foreground">
                        {day.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg border text-sm ${getWorkoutColor(
                      day.workout,
                    )}`}
                  >
                    {day.workout}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Planned Cost</div>
                    <div className="font-semibold">
                      {Math.round(day.plannedCost).toLocaleString("vi-VN")} VND
                    </div>
                  </div>
                  <div className="text-muted-foreground">-</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="text-sm font-medium mb-3">Workout Types</div>
        <div className="flex gap-4 flex-wrap">
          {[
            { type: "Cardio", color: "bg-blue-50 text-blue-700 border-blue-200" },
            { type: "Strength", color: "bg-purple-50 text-purple-700 border-purple-200" },
            { type: "HIIT", color: "bg-orange-50 text-orange-700 border-orange-200" },
            { type: "Rest", color: "bg-gray-100 text-gray-700 border-gray-200" },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-lg border text-sm ${item.color}`}>
                {item.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
