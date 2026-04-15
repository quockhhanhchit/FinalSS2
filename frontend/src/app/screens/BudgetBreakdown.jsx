import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { apiGet, apiPost } from "../lib/api";

export function BudgetBreakdown() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [error, setError] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadBudget() {
      try {
        const data = await apiGet("/api/budget/current");

        if (!ignore) {
          setBudget(data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadBudget();

    return () => {
      ignore = true;
    };
  }, []);

  const budgetData = useMemo(
    () => {
      const items = [
        { name: "Food", value: Number(budget?.food_amount || 0), color: "#10b981" },
        { name: "Workout", value: Number(budget?.workout_amount || 0), color: "#3b82f6" },
        { name: "Wellness", value: Number(budget?.wellness_amount || 0), color: "#f59e0b" },
        { name: "Buffer", value: Number(budget?.buffer_amount || 0), color: "#6b7280" },
      ];
      const total = items.reduce((sum, item) => sum + item.value, 0);

      return items.map((item) => ({
        ...item,
        percentage: total ? Math.round((item.value / total) * 100) : 0,
      }));
    },
    [budget],
  );

  const totalBudget = budgetData.reduce((sum, item) => sum + item.value, 0);
  const dailyBudget = Number(budget?.daily_budget || Math.round(totalBudget / 30));
  const isHomeWorkoutBudget = budget && Number(budget.workout_amount || 0) === 0;

  const handleRegeneratePlan = async () => {
    setError("");
    setIsRegenerating(true);

    try {
      await apiPost("/api/plans/generate", {});
      const data = await apiGet("/api/budget/current");
      setBudget(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Budget Breakdown</h1>
          <p className="text-muted-foreground">
            Your personalized 30-day budget allocation
          </p>
        </div>
        <Button className="gap-2" onClick={handleRegeneratePlan} disabled={isRegenerating}>
          <RefreshCw className="w-4 h-4" />
          {isRegenerating ? "Regenerating..." : "Regenerate Plan"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isHomeWorkoutBudget ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Home workout selected: workout budget is set to 0 VND and reallocated
          to food, wellness, and buffer with priority on food.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold mb-6">Monthly Allocation</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${Number(value).toLocaleString("vi-VN")} VND`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {budgetData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>
            <div className="space-y-4">
              {budgetData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-semibold">
                      {item.value.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{item.percentage}% of total</span>
                    <span>~{Math.round(item.value / 30).toLocaleString("vi-VN")} VND/day</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Total Monthly Budget
                </div>
                <div className="text-3xl font-bold">
                  {totalBudget.toLocaleString("vi-VN")} VND
                </div>
              </div>
              <div className="h-px bg-border" />
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Daily Budget
                </div>
                <div className="text-2xl font-semibold">
                  {dailyBudget.toLocaleString("vi-VN")} VND
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/app/plan")}
            className="w-full h-12 gap-2"
          >
            View 30-Day Plan
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {budgetData.map((item) => (
          <div
            key={item.name}
            className="bg-card rounded-xl p-4 shadow-sm border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="font-medium">{item.name}</div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {item.value.toLocaleString("vi-VN")}
            </div>
            <div className="text-xs text-muted-foreground">VND / month</div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-sm text-muted-foreground">Daily avg.</div>
              <div className="font-semibold">
                {Math.round(item.value / 30).toLocaleString("vi-VN")} VND
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-semibold mb-3">Budget Tips</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary">1</span>
            </div>
            <div>
              <div className="font-medium text-sm mb-1">Cook at home</div>
              <div className="text-sm text-muted-foreground">
                Preparing meals at home can save up to 40% on food costs
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary">2</span>
            </div>
            <div>
              <div className="font-medium text-sm mb-1">Home workouts</div>
              <div className="text-sm text-muted-foreground">
                No gym membership needed with bodyweight exercises
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
