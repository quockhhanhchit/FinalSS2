import { useEffect, useMemo, useState } from "react";
import { TrendingDown, Target, CheckCircle, Wallet, Trophy, Flame } from "lucide-react";
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
import { useNavigate, useSearchParams } from "react-router";
import { apiGet, apiPost } from "../lib/api";
import { DashboardAnalytics } from "../components/DashboardAnalytics";
import { useLanguage } from "../LanguageContext";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-9 w-48 rounded-lg bg-secondary animate-pulse mb-2" />
        <div className="h-5 w-72 rounded-lg bg-secondary animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-6">
            <div className="h-10 w-10 rounded-lg bg-secondary animate-pulse mb-4" />
            <div className="h-8 w-24 rounded-lg bg-secondary animate-pulse mb-2" />
            <div className="h-4 w-32 rounded-lg bg-secondary animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-card p-6">
            <div className="h-6 w-40 rounded-lg bg-secondary animate-pulse mb-6" />
            <div className="h-[300px] rounded-xl bg-secondary animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartEmptyState({ onClick }) {
  return (
    <div className="h-[300px] rounded-xl border border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center text-center px-8">
      <div className="font-semibold mb-2">Bạn chưa có dữ liệu biểu đồ.</div>
      <p className="text-sm text-muted-foreground mb-4">
        Bấm vào đây để khai báo theo dõi và xem biểu đồ tiến độ.
      </p>
      <Button size="sm" onClick={onClick}>
        Đến trang theo dõi
      </Button>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [isContinuingPlan, setIsContinuingPlan] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        const [data, analyticsData, planData] = await Promise.all([
          apiGet("/api/dashboard/summary"),
          apiGet("/api/dashboard/analytics"),
          apiGet("/api/plans/current").catch(() => null),
        ]);

        if (!ignore) {
          setDashboard(data);
          setAnalytics(analyticsData);
          setPlan(planData);
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
      day: `Ngày ${index + 1}`,
      weight: Number(entry.weight_kg),
    }));
  }, [dashboard]);

  const spendingData = useMemo(() => {
    const budgetPerWeek = (dashboard?.budgetTotal || 0) / 4;
    const weeklyTotals = new Map();

    for (const entry of dashboard?.spendingLogs || dashboard?.expenseLogs || []) {
      const date = new Date(entry.log_date);
      const weekKey = `Tuần ${Math.floor(date.getDate() / 7) + 1}`;
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
  const goalWeight = Number(dashboard?.goalWeight || 0);
  const weightProgress = Number(dashboard?.goalProgress || 0);
  const totalSpent = Number(dashboard?.totalSpent || 0);
  const totalBudget = Number(dashboard?.budgetTotal || 0);
  const budgetProgress = totalBudget ? (totalSpent / totalBudget) * 100 : 0;
  const daysCompleted = Number(dashboard?.daysCompleted || 0);
  const adherenceRate = daysCompleted
    ? Math.min(100, Math.round((daysCompleted / 30) * 100))
    : 0;
  const weeklyStats = dashboard?.weeklyStats || {};
  const achievements = dashboard?.achievements || [];
  const currentStreak = Number(dashboard?.currentStreak || 0);
  const bestStreak = Number(dashboard?.bestStreak || 0);
  const showPlanSummary =
    searchParams.get("summary") === "plan-complete" || Boolean(plan?.can_prompt_continue);
  const planDays = plan?.days || [];
  const planTotalDays = planDays.length || 30;
  const planCompletedDays = planDays.filter((day) => Boolean(day.completed)).length;
  const planSkippedDays = planDays.filter(
    (day) => !day.completed && day.lock_type === "skipped",
  ).length;
  const planTotalFoodCost = planDays.reduce(
    (sum, day) => sum + Number(day.planned_cost || 0),
    0,
  );
  const goalType = dashboard?.goalType || "lose";
  const getAchievementTitle = (achievement) => {
    if (language === "en") {
      if (achievement.title_en || achievement.titleEn) {
        return achievement.title_en || achievement.titleEn;
      }

      if (achievement.code === "W1") {
        if (goalType === "gain") return "Weight Gain Progress";
        if (goalType === "maintain") return "Weight Maintenance";
        return "Weight Loss Progress";
      }

      const titleByCode = {
        B1: "Started Expense Tracking",
        D1: "First Day Completed",
        S3: "3-Day Streak",
        GYM: "Workout Momentum",
        SAVE: "Within Budget",
      };

      if (titleByCode[achievement.code]) {
        return titleByCode[achievement.code];
      }

      return t(achievement.title);
    }

    if (achievement.code === "W1") {
      if (goalType === "gain") return "Tiến bộ tăng cân";
      if (goalType === "maintain") return "Duy trì cân nặng";
      return "Tiến bộ giảm cân";
    }

    return achievement.title;
  };
  const getAchievementDescription = (achievement) => {
    if (language === "en") {
      if (achievement.description_en || achievement.descriptionEn) {
        return achievement.description_en || achievement.descriptionEn;
      }

      if (achievement.code === "W1") {
        if (goalType === "gain") return "Track progress toward your weight-gain goal.";
        if (goalType === "maintain") return "Keep your weight stable over time.";
        return "Track progress toward your weight-loss goal.";
      }

      const descriptionByCode = {
        B1: "You logged your first expense.",
        D1: "You completed your first plan day.",
        S3: "You maintained your routine for 3 consecutive days.",
        GYM: "You completed workout tasks this week.",
        SAVE: "Your spending remains within your planned budget.",
      };

      if (descriptionByCode[achievement.code]) {
        return descriptionByCode[achievement.code];
      }

      return t(achievement.description);
    }

    if (achievement.code === "W1") {
      if (goalType === "gain") return "Theo dõi tiến độ theo mục tiêu tăng cân.";
      if (goalType === "maintain") return "Duy trì cân nặng ổn định theo thời gian.";
      return "Theo dõi tiến độ theo mục tiêu giảm cân.";
    }

    return achievement.description;
  };

  if (!dashboard && !error) {
    return <DashboardSkeleton />;
  }

  const handleContinuePlan = async () => {
    setIsContinuingPlan(true);
    setError("");

    try {
      const result = await apiPost("/api/plans/current/continue", {
        startFromToday: false,
      });
      const nextPlan = await apiGet("/api/plans/current");
      setPlan(nextPlan);
      navigate(result?.startDate ? "/app/plan" : "/app", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsContinuingPlan(false);
    }
  };

  const handleDeclineContinuation = async () => {
    setIsContinuingPlan(true);
    setError("");

    try {
      const response = await apiPost("/api/plans/current/decline-continuation", {});
      setPlan((current) =>
        current
          ? {
              ...current,
              can_prompt_continue: false,
              has_declined_continuation: true,
              continuation_declined_after_day: response?.declinedAfterDay,
            }
          : current,
      );
      navigate("/app", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsContinuingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-3xl font-semibold mb-2">Tổng quan</h1>
          <p className="text-muted-foreground">
          Theo dõi tiến độ và bám sát mục tiêu của bạn
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {showPlanSummary ? (
        <div className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-1 shadow-2xl shadow-orange-500/20 dark:border-amber-900">
          <div className="rounded-[1.35rem] bg-white/95 p-6 dark:bg-slate-950/90">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-lg">
                  <Trophy className="h-9 w-9" />
                </div>
                <div>
                  <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-200">
                    <Flame className="h-4 w-4" />
                    Tổng kết kế hoạch
                  </div>
                  <h2 className="text-2xl font-bold">Bạn đã hoàn thành kế hoạch</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    Bạn đã đi tới ngày cuối cùng của chu kỳ hiện tại. Một vài ngày có thể bị bỏ qua, nhưng hệ thống vẫn tổng kết dựa trên những gì bạn đã thực hiện.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeclineContinuation}
                  disabled={isContinuingPlan}
                >
                  Không, giữ như hiện tại
                </Button>
                <Button
                  type="button"
                  onClick={handleContinuePlan}
                  disabled={isContinuingPlan}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 text-white"
                >
                  {isContinuingPlan ? "Đang xử lý..." : "Có, tiếp tục 30 ngày"}
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm text-muted-foreground">Ngày đã hoàn thành</div>
                <div className="mt-1 text-2xl font-bold">{planCompletedDays}/{planTotalDays}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm text-muted-foreground">Ngày đã bỏ qua</div>
                <div className="mt-1 text-2xl font-bold">{planSkippedDays}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm text-muted-foreground">Chuỗi tốt nhất</div>
                <div className="mt-1 text-2xl font-bold">{bestStreak} ngày</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm text-muted-foreground">Chi phí food dự kiến</div>
                <div className="mt-1 text-2xl font-bold">{Math.round(planTotalFoodCost / 1000)}k</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm text-muted-foreground">Cân nặng hiện tại</div>
          </div>
          <div className="text-3xl font-bold mb-1">{currentWeight || "--"} kg</div>
          <div className="text-sm text-primary">
            {startWeight && currentWeight
              ? `${(currentWeight - startWeight).toFixed(1)} kg so với ban đầu`
              : "Chưa có dữ liệu"}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-sm text-muted-foreground">Tiến độ mục tiêu</div>
          </div>
          <div className="text-3xl font-bold mb-1">{Math.round(weightProgress)}%</div>
          <div className="text-sm text-muted-foreground">
            {currentWeight && startWeight
              ? `Còn ${Math.abs(goalWeight - currentWeight).toFixed(1)} kg tới mục tiêu`
              : "Hoàn thành onboarding trước"}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-muted-foreground">Mức bám sát tuần</div>
          </div>
          <div className="text-3xl font-bold mb-1">{adherenceRate}%</div>
          <div className="text-sm text-primary">{daysCompleted} ngày đã hoàn thành</div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-sm text-muted-foreground">Ngân sách đã dùng</div>
          </div>
          <div className="text-3xl font-bold mb-1">{Math.round(budgetProgress)}%</div>
          <div className="text-sm text-primary">
            {totalBudget
              ? `${Math.round(totalSpent / 1000)}k / ${Math.round(totalBudget / 1000)}k VND`
              : "No budget yet"}
          </div>
        </div>
      </div>

      <DashboardAnalytics analytics={analytics} />

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Tiến độ cân nặng</h3>
              <p className="text-sm text-muted-foreground">Cân nặng của bạn theo thời gian</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/tracking")}>
              Xem chi tiết
            </Button>
          </div>
          {weightData.length === 0 ? (
            <ChartEmptyState onClick={() => navigate("/app/tracking")} />
          ) : (
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
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">Ban đầu</div>
              <div className="font-semibold">{startWeight || "--"} kg</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Hiện tại</div>
              <div className="font-semibold text-primary">{currentWeight || "--"} kg</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Mục tiêu</div>
              <div className="font-semibold">{goalWeight || "--"} kg</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-1">Chi tiêu so với ngân sách</h3>
              <p className="text-sm text-muted-foreground">
                Chi tiêu tracking và các ngày đã hoàn thành trong kế hoạch
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/tracking")}>
              Xem chi tiết
            </Button>
          </div>
          {spendingData.length === 0 ? (
            <ChartEmptyState onClick={() => navigate("/app/tracking")} />
          ) : (
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
                    name="Đã chi"
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="#e5e7eb"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#6b7280", r: 3 }}
                    name="Ngân sách"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">Tổng đã chi</div>
              <div className="font-semibold">{Math.round(totalSpent / 1000)}k VND</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">TB mỗi tuần</div>
              <div className="font-semibold">
                {spendingData.length
                  ? `${Math.round(totalSpent / spendingData.length / 1000)}k VND`
                  : "0k VND"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Còn lại</div>
              <div className="font-semibold text-primary">
                {Math.round((totalBudget - totalSpent) / 1000)}k VND
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h4 className="font-semibold mb-4">Tuần này</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ngày hoàn thành</span>
              <span className="font-semibold">
                {Number(weeklyStats.daysCompletedThisWeek || 0)}/7
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bài tập đã làm</span>
              <span className="font-semibold">
                {Number(weeklyStats.workoutsDoneThisWeek || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bữa ăn đã ghi nhận</span>
              <span className="font-semibold">
                {Number(weeklyStats.mealsLoggedThisWeek || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h4 className="font-semibold mb-4">Tiến độ tổng thể</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tổng số ngày</span>
              <span className="font-semibold">{daysCompleted}/30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Chuỗi hiện tại</span>
              <span className="font-semibold">{currentStreak} ngày</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Chuỗi tốt nhất</span>
              <span className="font-semibold">{bestStreak} ngày</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h4 className="font-semibold mb-4">Thành tựu</h4>
          <div className="space-y-3">
            {achievements.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Hoàn thành tracking hoặc nhiệm vụ hằng ngày để mở khóa thành tựu.
              </div>
            ) : null}
            {achievements.map((achievement) => (
              <div key={achievement.code} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span>{achievement.code}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">{getAchievementTitle(achievement)}</div>
                  <div className="text-xs text-muted-foreground">
                    {getAchievementDescription(achievement)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          onClick={() => navigate("/app/plan")}
          className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all"
        >
          <h3 className="text-xl font-semibold mb-2">Xem kế hoạch 30 ngày</h3>
          <p className="text-white/90 mb-4">
            Xem các bài tập và bữa ăn sắp tới
          </p>
          <Button variant="secondary" size="sm">
            Đến kế hoạch
          </Button>
        </div>

        <div
          onClick={() => navigate("/app/budget-breakdown")}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-all"
        >
          <h3 className="text-xl font-semibold mb-2">Xem phân bổ ngân sách</h3>
          <p className="text-white/90 mb-4">
            Tối ưu cách phân bổ chi tiêu của bạn
          </p>
          <Button variant="secondary" size="sm">
            Xem ngân sách
          </Button>
        </div>
      </div>
    </div>
  );
}
