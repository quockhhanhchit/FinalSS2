import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  List,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { apiGet, apiPost } from "../lib/api";

function toDateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildMonthCalendar(planDays, targetDate) {
  const monthStart = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    1,
  );
  const monthEnd = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    0,
  );
  const planDayByDate = new Map(
    planDays.map((day) => [toDateKey(day.date), day]),
  );
  const cells = [];

  for (let index = 0; index < monthStart.getDay(); index += 1) {
    cells.push({ type: "blank", key: `blank-${index}` });
  }

  for (let date = 1; date <= monthEnd.getDate(); date += 1) {
    const currentDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      date,
    );
    const key = toDateKey(currentDate);

    cells.push({
      type: "date",
      key,
      date: currentDate,
      planDay: planDayByDate.get(key) || null,
    });
  }

  return cells;
}

function formatVndShort(value) {
  return `${Math.round(Number(value || 0) / 1000)}k`;
}

export function Plan() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("calendar");
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [displayDate, setDisplayDate] = useState(new Date());
  const [isContinuingPlan, setIsContinuingPlan] = useState(false);

  const loadPlan = async () => {
    const data = await apiGet("/api/plans/current");

    setPlan(data);
    setError("");

    return data;
  };

  useEffect(() => {
    let ignore = false;

    async function loadCurrentPlan() {
      try {
        const data = await apiGet("/api/plans/current");

        if (!ignore) {
          setPlan(data);
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadCurrentPlan();
    window.addEventListener("budgetfit:budget-updated", loadCurrentPlan);

    return () => {
      ignore = true;
      window.removeEventListener("budgetfit:budget-updated", loadCurrentPlan);
    };
  }, []);

  const planDays = useMemo(
    () =>
      (plan?.days || []).map((day) => ({
        day: Number(day.day_number),
        date: new Date(day.plan_date),
        dateKey: toDateKey(day.plan_date),
        workout: day.workout_type,
        plannedCost: Number(day.planned_cost || 0),
        completed: Boolean(day.completed),
        isLocked: Boolean(day.is_locked),
        lockReason: day.lock_reason,
      })),
    [plan],
  );

  useEffect(() => {
    if (planDays[0]?.date) {
      setDisplayDate(new Date(planDays[0].date));
    }
  }, [planDays]);

  const calendarCells = useMemo(
    () => buildMonthCalendar(planDays, displayDate),
    [planDays, displayDate],
  );
  const visiblePlanDays = useMemo(
    () =>
      planDays.filter(
        (day) =>
          day.date.getMonth() === displayDate.getMonth() &&
          day.date.getFullYear() === displayDate.getFullYear(),
      ),
    [planDays, displayDate],
  );
  const completedDays = planDays.filter((day) => day.completed).length;
  const dailyBudget = Number(plan?.budget?.daily_budget || 0);
  const averageDailyCost =
    dailyBudget ||
    (planDays.length
      ? Math.round(
          planDays.reduce((sum, day) => sum + day.plannedCost, 0) /
            planDays.length,
        )
      : 0);

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

  const handlePrevMonth = () => {
    setDisplayDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setDisplayDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const handleContinuePlan = async (startFromToday = false) => {
    setIsContinuingPlan(true);
    setError("");

    try {
      const result = await apiPost("/api/plans/current/continue", {
        startFromToday,
      });
      await loadPlan();
      if (result?.startDate) {
        setDisplayDate(new Date(result.startDate));
      }
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
      await apiPost("/api/plans/current/decline-continuation", {});
      await loadPlan();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsContinuingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      {plan?.can_prompt_continue ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold">
              Bạn đã hoàn thành kế hoạch 30 ngày
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Bạn có muốn tiếp tục thêm 30 ngày nữa không? Nếu chọn có, hệ thống sẽ tạo tiếp bữa ăn và bài tập từ ngày kế tiếp sau khi kế hoạch hiện tại kết thúc.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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
                onClick={() => handleContinuePlan(false)}
                disabled={isContinuingPlan}
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white"
              >
                {isContinuingPlan ? "Đang xử lý..." : "Có, tiếp tục 30 ngày"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Kế hoạch 30 ngày</h1>
          <p className="text-muted-foreground">
            Lịch ăn uống và tập luyện cá nhân hóa theo thời gian thực tế
          </p>
        </div>
        <div className="flex w-full gap-2 bg-secondary rounded-lg p-1 sm:w-fit">
          <Button
            variant={viewMode === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="flex-1 gap-2 sm:flex-none"
          >
            <CalendarIcon className="w-4 h-4" />
            Lịch
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex-1 gap-2 sm:flex-none"
          >
            <List className="w-4 h-4" />
            Danh sách
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">
            Ngày đã hoàn thành
          </div>
          <div className="text-2xl font-bold">
            {completedDays} / {planDays.length || 30}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {planDays.length
              ? `${Math.round((completedDays / planDays.length) * 100)}% hoàn thành`
              : "Chưa có kế hoạch"}
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">
            Chuỗi hiện tại
          </div>
          <div className="text-2xl font-bold">{completedDays} ngày</div>
          <div className="text-xs text-muted-foreground mt-1">
            Dựa trên số ngày đã hoàn thành
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">
            Ngân sách TB/ngày
          </div>
          <div className="text-2xl font-bold">
            {averageDailyCost ? formatVndShort(averageDailyCost) : "0k"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Match với Budget Breakdown
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">
            Trạng thái ngân sách
          </div>
          <div className="text-2xl font-bold text-primary">
            {plan ? "Đang hoạt động" : "Đang chờ"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {plan?.status === "active"
              ? `${Number(plan?.budget?.total_budget || 0).toLocaleString("vi-VN")} VND`
              : "Tạo kế hoạch ở bước onboarding"}
          </div>
        </div>
      </div>

      {viewMode === "calendar" && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">
              {displayDate.toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric",
              }) || "Kế hoạch hiện tại"}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="h-9 w-9 rounded-full"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="h-9 w-9 rounded-full"
                aria-label="Tháng sau"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground pb-2"
              >
                {day}
              </div>
            ))}

            {calendarCells.map((cell) => {
              if (cell.type === "blank") {
                return <div key={cell.key} />;
              }

              if (!cell.planDay) {
                return (
                  <div
                    key={cell.key}
                    className="pointer-events-none min-h-[112px] cursor-not-allowed rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-slate-400 opacity-60 dark:border-slate-700 dark:bg-slate-800/55 dark:text-slate-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {cell.date.getDate()}
                      </span>
                      <span className="text-xs">
                        {cell.date.toLocaleDateString("vi-VN", {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                    <div className="mt-6 text-xs">Bỏ qua</div>
                  </div>
                );
              }

              const day = cell.planDay;

              return (
                <button
                  key={cell.key}
                  onClick={() => navigate(`/app/plan/day/${day.day}`)}
                  title={day.lockReason || undefined}
                  className={`relative min-h-[112px] p-3 rounded-xl border transition-all text-left ${
                    day.isLocked
                      ? "border-slate-200 bg-slate-100 text-slate-400 grayscale"
                      : day.completed
                        ? "border-primary bg-primary/5 hover:shadow-md"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">
                      {cell.date.getDate()}
                    </span>
                    {day.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="mb-2 text-xs text-muted-foreground">
                    {cell.date.toLocaleDateString("vi-VN", {
                      weekday: "long",
                    })}
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-md border ${getWorkoutColor(
                      day.workout,
                    )}`}
                  >
                    {day.workout}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Food: {formatVndShort(day.plannedCost)} VND
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div className="space-y-3">
          {visiblePlanDays.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/55 dark:text-slate-400">
              Không có ngày kế hoạch nào trong tháng này.
            </div>
          ) : null}

          {visiblePlanDays.map((day) => (
            <button
              key={day.day}
              onClick={() => navigate(`/app/plan/day/${day.day}`)}
              title={day.lockReason || undefined}
              className={`w-full rounded-xl p-4 shadow-sm border transition-all text-left ${
                day.isLocked
                  ? "bg-slate-100 border-slate-200 text-slate-400 grayscale"
                  : "bg-card border-border hover:shadow-md hover:border-primary/50"
              }`}
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
                      <div className="font-semibold">
                        {day.date.toLocaleDateString("vi-VN", {
                          weekday: "long",
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {day.date.toLocaleDateString("vi-VN", {
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
                    <div className="text-sm text-muted-foreground">
                      Chi phí food dự kiến
                    </div>
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
        <div className="text-sm font-medium mb-3">Loại bài tập</div>
        <div className="flex gap-4 flex-wrap">
          {[
            { type: "Cardio", color: "bg-blue-50 text-blue-700 border-blue-200" },
            {
              type: "Strength",
              color: "bg-purple-50 text-purple-700 border-purple-200",
            },
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
