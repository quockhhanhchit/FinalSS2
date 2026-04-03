import { useEffect, useMemo, useState } from "react";
import { TrendingDown, Target, CheckCircle, Wallet } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { apiGet } from "../lib/api";
import { formatCurrency } from "../lib/formatters";

export function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const data = await apiGet("/api/dashboard/summary");

        if (!ignore) {
          setDashboard(data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const weightData = useMemo(() => {
    const logs = dashboard?.weightLogs || [];

    return logs.map((entry, index) => ({
      day: `Day ${index + 1}`,
      weight: Number(entry.weight_kg),
    }));
  }, [dashboard]);

  const spendingData = useMemo(() => {
    const budgetPerWeek = (dashboard?.budgetTotal || 0) / 4;
    const weeklyTotals = new Map();

    for (const entry of dashboard?.expenseLogs || []) {
      const date = new Date(entry.log_date);
      const weekKey = `Week ${Math.floor(date.getDate() / 7) + 1}`;
      weeklyTotals.set(weekKey, (weeklyTotals.get(weekKey) || 0) + Number(entry.amount));
    }

    return Array.from(weeklyTotals.entries()).map(([week, spent]) => ({
      week,
      spent,
      budget: budgetPerWeek,
    }));
  }, [dashboard]);

  const currentWeight = Number(dashboard?.currentWeight || 0);
  const startWeight = Number(dashboard?.startWeight || 0);
  const goalWeight =
    dashboard?.goalType === "gain"
      ? startWeight + 5
      : dashboard?.goalType === "maintain"
        ? startWeight
        : startWeight - 5;
  const weightProgress = Number(dashboard?.goalProgress || 0);
  const totalSpent = Number(dashboard?.totalSpent || 0);
  const totalBudget = Number(dashboard?.budgetTotal || 0);
  const budgetProgress = totalBudget ? (totalSpent / totalBudget) * 100 : 0;
  const daysCompleted = Number(dashboard?.daysCompleted || 0);
  const adherenceRate = daysCompleted
    ? Math.min(100, Math.round((daysCompleted / 30) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and stay on target
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-muted-foreground">Current Weight</div>
          </div>
          <div className="text-3xl font-bold mb-1">{currentWeight || "--"} kg</div>
          <div className="text-sm text-primary">
            {startWeight && currentWeight
              ? `${(currentWeight - startWeight).toFixed(1)} kg from start`
              : "No data yet"}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-sm text-muted-foreground">Goal Progress</div>
          </div>
          <div className="text-3xl font-bold mb-1">{Math.round(weightProgress)}%</div>
          <div className="text-sm text-muted-foreground">
            {currentWeight && startWeight
              ? `${Math.abs(goalWeight - currentWeight).toFixed(1)} kg to goal`
              : "Complete onboarding first"}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-muted-foreground">Weekly Adherence</div>
          </div>
          <div className="text-3xl font-bold mb-1">{adherenceRate}%</div>
          <div className="text-sm text-primary">{daysCompleted} plan days completed</div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm text-muted-foreground">Budget Used</div>
          </div>
          <div className="text-3xl font-bold mb-1">{Math.round(budgetProgress)}%</div>
          <div className="text-sm text-primary">
            {totalBudget ? "Connected to backend" : "No budget yet"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Weight Progress</h3>
              <p className="text-sm text-muted-foreground">Your weight over time</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/tracking")}>
              View Details
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">Start</div>
              <div className="font-semibold">{startWeight || "--"} kg</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Current</div>
              <div className="font-semibold text-primary">{currentWeight || "--"} kg</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Goal</div>
              <div className="font-semibold">{goalWeight || "--"} kg</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Spending vs Budget</h3>
              <p className="text-sm text-muted-foreground">Weekly comparison</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/tracking")}>
              View Details
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${Math.round(value / 1000)}k VND`}
                />
                <Line
                  type="monotone"
                  dataKey="spent"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Spent"
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#e5e7eb"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#6b7280", r: 3 }}
                  name="Budget"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">Total Spent</div>
              <div className="font-semibold">{Math.round(totalSpent / 1000)}k VND</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Weekly Avg</div>
              <div className="font-semibold">
                {spendingData.length
                  ? `${Math.round(totalSpent / spendingData.length / 1000)}k VND`
                  : "0k VND"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Remaining</div>
              <div className="font-semibold text-primary">
                {Math.round((totalBudget - totalSpent) / 1000)}k VND
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h4 className="font-semibold mb-4">This Week</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Days completed</span>
              <span className="font-semibold">{Math.min(daysCompleted, 7)}/7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Workouts done</span>
              <span className="font-semibold">{Math.min(daysCompleted, 5)}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Meals logged</span>
              <span className="font-semibold">{(dashboard?.expenseLogs || []).length}/21</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h4 className="font-semibold mb-4">Overall Progress</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total days</span>
              <span className="font-semibold">{daysCompleted}/30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current streak</span>
              <span className="font-semibold">{daysCompleted} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Best streak</span>
              <span className="font-semibold">{daysCompleted} days</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h4 className="font-semibold mb-4">Achievements</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span>T1</span>
              </div>
              <div className="text-sm">First week complete</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span>T2</span>
              </div>
              <div className="text-sm">{daysCompleted} plan days done</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span>T3</span>
              </div>
              <div className="text-sm">{formatCurrency(totalBudget - totalSpent)} VND left</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => navigate("/app/plan")}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all"
        >
          <h3 className="text-xl font-semibold mb-2">View Your 30-Day Plan</h3>
          <p className="text-white/90 mb-4">
            See your upcoming workouts and meals
          </p>
          <Button variant="secondary" size="sm">
            Go to Plan
          </Button>
        </div>

        <div
          onClick={() => navigate("/app/budget-breakdown")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all"
        >
          <h3 className="text-xl font-semibold mb-2">Review Budget Breakdown</h3>
          <p className="text-white/90 mb-4">
            Optimize your spending allocation
          </p>
          <Button variant="secondary" size="sm">
            View Budget
          </Button>
        </div>
      </div>
    </div>
  );
}
