import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Sunrise,
  Sun,
  Sunset,
  Cookie,
  Dumbbell,
  Moon,
  Droplet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { apiGet, apiPatch, apiPut } from "../lib/api";
import { showToast } from "../components/ui/toast";

function getMealSection(meal, index) {
  const value = `${meal.meal_time || ""} ${meal.meal_name || ""}`.toLowerCase();

  if (value.includes("breakfast") || value.includes("sáng")) return "breakfast";
  if (value.includes("lunch") || value.includes("trưa")) return "lunch";
  if (value.includes("dinner") || value.includes("tối")) return "dinner";
  if (value.includes("snack") || value.includes("phụ")) return "snacks";

  if (index === 0) return "breakfast";
  if (index === 1) return "lunch";
  if (index === 2) return "dinner";
  return "snacks";
}

function formatMealTime(mealTime) {
  return String(mealTime || "")
    .replace("7:00 PM", "19:00")
    .replace("07:00 PM", "19:00");
}

function MealGroup({
  title,
  subtitle,
  icon: Icon,
  gradient,
  hoverBorder,
  meals,
  checkedItems,
  onToggle,
  onSwap,
  swappingId,
  disabled = false,
}) {
  if (meals.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="pl-12 space-y-3">
        {meals.map((meal) => (
          <div key={meal.id} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`relative flex items-start gap-3 rounded-xl border border-border p-4 ${disabled ? "opacity-70" : hoverBorder} transition-all`}>
              <button
                onClick={() => onToggle(meal.id)}
                disabled={disabled}
                className="flex flex-1 items-start gap-4 text-left disabled:cursor-not-allowed"
              >
                {checkedItems.has(meal.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium mb-1">{meal.name}</div>
                  <div className="text-sm text-muted-foreground">{meal.time}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold">{meal.calories} kcal</div>
                  <div className="text-sm text-muted-foreground">
                    {meal.cost.toLocaleString("vi-VN")} VND
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onSwap(meal.rawId)}
                disabled={disabled || swappingId === meal.id}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                title="Đổi món"
              >
                {swappingId === meal.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyRoutine() {
  const navigate = useNavigate();
  const { dayId } = useParams();
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [dayData, setDayData] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [swappingId, setSwappingId] = useState("");
  const [showActualCostPrompt, setShowActualCostPrompt] = useState(false);
  const [actualCostInput, setActualCostInput] = useState("");
  const lastSavedSignatureRef = useRef("");

  const dayNumber = Number(dayId || 1);

  useEffect(() => {
    let ignore = false;

    async function loadDay() {
      try {
        const data = await apiGet(`/api/plans/current/day/${dayNumber}`);

        if (!ignore) {
          const completedTaskIds = new Set(data?.completed_tasks || []);

          setDayData(data);
          setCheckedItems(completedTaskIds);
          lastSavedSignatureRef.current = JSON.stringify(
            [...completedTaskIds].sort(),
          );
          setError("");
          setSaveMessage("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadDay();
    window.addEventListener("budgetfit:budget-updated", loadDay);

    return () => {
      ignore = true;
      window.removeEventListener("budgetfit:budget-updated", loadDay);
    };
  }, [dayNumber]);

  async function saveProgress(taskIds, options = {}) {
    if (!dayData || dayData.is_locked) {
      return false;
    }

    const sortedTaskIds = [...taskIds].sort();
    const signature = JSON.stringify(sortedTaskIds);

    if (!options.force && signature === lastSavedSignatureRef.current) {
      return true;
    }

    setIsSaving(true);

    try {
      const response = await apiPut(`/api/plans/current/day/${dayNumber}/complete`, {
        completedTasks: sortedTaskIds,
      });

      lastSavedSignatureRef.current = JSON.stringify(
        [...(response?.completed_tasks || sortedTaskIds)].sort(),
      );
      setSaveMessage(
        response?.completed ? "Đã hoàn thành và lưu ngày này." : "Đã lưu tiến độ.",
      );
      if (response?.awardedBadges?.length) {
        response.awardedBadges.forEach((badge) => {
          showToast(`Bạn vừa mở khóa huy hiệu ${badge}.`, "success");
        });
      }
      setError("");
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (!dayData || dayData.is_locked) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      saveProgress(checkedItems);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [checkedItems, dayData]);

  const formattedDate = useMemo(() => {
    const date = dayData?.plan_date ? new Date(dayData.plan_date) : new Date();
    return date.toLocaleDateString("vi-VN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [dayData]);

  const normalizedDayData = useMemo(() => {
    const groupedMeals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    (dayData?.meals || []).forEach((meal, index) => {
      const section = getMealSection(meal, index);

      groupedMeals[section].push({
        id: `meal-${meal.id}`,
        rawId: meal.id,
        name: meal.meal_name,
        calories: Number(meal.calories),
        cost: Number(meal.cost),
        time: formatMealTime(meal.meal_time),
      });
    });

    const workouts = (dayData?.workouts || []).map((workout) => ({
      id: `workout-${workout.id}`,
      rawId: workout.id,
      name: workout.workout_name,
      duration: `${workout.duration_minutes} min`,
      durationMinutes: Number(workout.duration_minutes || 0),
      description: workout.description,
    }));

    return {
      day: dayData?.day_number || dayNumber,
      date: formattedDate,
      workout: dayData?.workout_type || "Bài tập",
      plannedCalories: Number(dayData?.planned_calories || 0),
      plannedCost: Number(dayData?.planned_cost || 0),
      actualCost:
        dayData?.actual_cost === null || dayData?.actual_cost === undefined
          ? null
          : Number(dayData.actual_cost),
      meals: groupedMeals,
      allMeals: [
        ...groupedMeals.breakfast,
        ...groupedMeals.lunch,
        ...groupedMeals.dinner,
        ...groupedMeals.snacks,
      ],
      workouts,
      sleep: {
        id: "sleep",
        ...(dayData?.sleep || { target: "8 giờ", time: "22:00 - 06:00" }),
      },
      water: {
        id: "water",
        ...(dayData?.water || { target: "2,5 lít", glasses: 10 }),
      },
    };
  }, [dayData, dayNumber, formattedDate]);

  const toggleCheck = (id) => {
    if (dayData?.is_locked) {
      return;
    }

    setSaveMessage("");
    setCheckedItems((currentChecked) => {
      const newChecked = new Set(currentChecked);

      if (newChecked.has(id)) {
        newChecked.delete(id);
      } else {
        newChecked.add(id);
      }

      return newChecked;
    });
  };

  const totalChecked = checkedItems.size;
  const totalItems =
    normalizedDayData.allMeals.length + normalizedDayData.workouts.length + 2;
  const completionPercentage = totalItems
    ? Math.round((totalChecked / totalItems) * 100)
    : 0;
  const workoutDuration = normalizedDayData.workouts.reduce(
    (sum, workout) => sum + workout.durationMinutes,
    0,
  );
  const isReadOnly = Boolean(dayData?.is_locked);
  const actualCostDelta =
    normalizedDayData.actualCost === null
      ? null
      : normalizedDayData.plannedCost - normalizedDayData.actualCost;

  const handleSwapMeal = async (mealId) => {
    if (isReadOnly) return;

    setSwappingId(`meal-${mealId}`);
    setError("");

    try {
      const response = await apiPatch(`/api/plans/day/${dayNumber}/swap-meal/${mealId}`);
      setDayData((current) => ({
        ...current,
        planned_cost: response.planned_cost ?? current.planned_cost,
        meals: (current?.meals || []).map((meal) =>
          meal.id === mealId ? response.meal : meal
        ),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSwappingId("");
    }
  };

  const handleSwapWorkout = async (workoutId) => {
    if (isReadOnly) return;

    setSwappingId(`workout-${workoutId}`);
    setError("");

    try {
      const response = await apiPatch(
        `/api/plans/day/${dayNumber}/swap-workout/${workoutId}`
      );
      setDayData((current) => ({
        ...current,
        workouts: (current?.workouts || []).map((workout) =>
          workout.id === workoutId ? response.workout : workout
        ),
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSwappingId("");
    }
  };

  const handleFinishDay = async () => {
    if (isReadOnly) {
      return;
    }

    if (completionPercentage === 100 && normalizedDayData.actualCost === null) {
      setActualCostInput(String(normalizedDayData.plannedCost || ""));
      setShowActualCostPrompt(true);
      return;
    }

    const wasSaved = await saveProgress(checkedItems, { force: true });

    if (wasSaved) {
      navigate("/app/plan");
    }
  };

  const handleSaveActualCost = async () => {
    const actualCost = Number(actualCostInput);

    if (!Number.isFinite(actualCost) || actualCost < 0) {
      setError("Chi phí thực tế không hợp lệ.");
      return;
    }

    const wasSaved = await saveProgress(checkedItems, { force: true });

    if (!wasSaved) return;

    setIsSaving(true);

    try {
      const response = await apiPatch(`/api/plans/day/${dayNumber}/actual-cost`, {
        actual_cost: actualCost,
      });

      setDayData((current) => ({
        ...current,
        actual_cost: response.actual_cost,
      }));
      if (response?.awardedBadges?.length) {
        response.awardedBadges.forEach((badge) => {
          showToast(`Bạn vừa mở khóa huy hiệu ${badge}.`, "success");
        });
      }
      setShowActualCostPrompt(false);
      navigate("/app/plan");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/app/plan")}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold mb-1">Ngày {normalizedDayData.day}</h1>
          <p className="text-muted-foreground">{normalizedDayData.date}</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {saveMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveMessage}
        </div>
      ) : null}

      {isReadOnly ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {dayData?.lock_reason || "Ngày này đã bị khóa, bạn chỉ có thể xem lại tiến độ."}
        </div>
      ) : null}

      <div className={`bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 ${isReadOnly ? "grayscale opacity-80" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Tiến độ trong ngày</div>
            <div className="text-3xl font-bold">{completionPercentage}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Nhiệm vụ đã hoàn thành</div>
            <div className="text-2xl font-semibold">
              {totalChecked} / {totalItems}
            </div>
          </div>
        </div>
        <div className="h-3 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-4 ${isReadOnly ? "grayscale opacity-80" : ""}`}>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Calo dự kiến</div>
          <div className="text-2xl font-bold">{normalizedDayData.plannedCalories}</div>
          <div className="text-xs text-muted-foreground mt-1">kcal</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Chi phí dự kiến</div>
          <div className="text-2xl font-bold">
            {Math.round(normalizedDayData.plannedCost / 1000)}k
          </div>
          <div className="text-xs text-muted-foreground mt-1">VND</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Loại bài tập</div>
          <div className="text-lg font-bold">{normalizedDayData.workout}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Tổng {workoutDuration} phút
          </div>
        </div>
      </div>

      {normalizedDayData.actualCost !== null ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            actualCostDelta >= 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          Thực chi: {normalizedDayData.actualCost.toLocaleString("vi-VN")} VND.
          {actualCostDelta >= 0
            ? ` Tiết kiệm ${actualCostDelta.toLocaleString("vi-VN")} VND so với kế hoạch.`
            : ` Vượt ${Math.abs(actualCostDelta).toLocaleString("vi-VN")} VND so với kế hoạch.`}
        </div>
      ) : null}

      <div className={`bg-card rounded-2xl p-6 shadow-sm border border-border ${isReadOnly ? "grayscale opacity-80" : ""}`}>
        <div className="flex items-center gap-2 mb-6">
          <Cookie className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Kế hoạch dinh dưỡng</h3>
          <span className="text-sm text-muted-foreground">
            ({normalizedDayData.allMeals.filter((meal) => checkedItems.has(meal.id)).length}/{normalizedDayData.allMeals.length} meals)
          </span>
        </div>

        <div className="space-y-6">
          <MealGroup
            title="Bữa sáng"
            icon={Sunrise}
            gradient="from-amber-400 to-orange-500"
            hoverBorder="hover:border-amber-500/50"
            meals={normalizedDayData.meals.breakfast}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
            onSwap={handleSwapMeal}
            swappingId={swappingId}
            disabled={isReadOnly}
          />
          <MealGroup
            title="Bữa trưa"
            icon={Sun}
            gradient="from-emerald-400 to-teal-500"
            hoverBorder="hover:border-teal-500/50"
            meals={normalizedDayData.meals.lunch}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
            onSwap={handleSwapMeal}
            swappingId={swappingId}
            disabled={isReadOnly}
          />
          <MealGroup
            title="Bữa tối"
            icon={Sunset}
            gradient="from-purple-400 to-violet-500"
            hoverBorder="hover:border-purple-500/50"
            meals={normalizedDayData.meals.dinner}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
            onSwap={handleSwapMeal}
            swappingId={swappingId}
            disabled={isReadOnly}
          />
          <MealGroup
            title="Bữa phụ"
            icon={Cookie}
            gradient="from-pink-400 to-rose-500"
            hoverBorder="hover:border-pink-500/50"
            meals={normalizedDayData.meals.snacks}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
            onSwap={handleSwapMeal}
            swappingId={swappingId}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <div className={`bg-card rounded-2xl p-6 shadow-sm border border-border ${isReadOnly ? "grayscale opacity-80" : ""}`}>
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tập luyện</h3>
          <span className="text-sm text-muted-foreground">
            ({normalizedDayData.workouts.filter((workout) => checkedItems.has(workout.id)).length}/{normalizedDayData.workouts.length})
          </span>
        </div>
        <div className="space-y-3">
          {normalizedDayData.workouts.map((workout) => (
            <div
              key={workout.id}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border border-border transition-all text-left ${isReadOnly ? "opacity-70" : "hover:border-primary/50"}`}
            >
              <button
                onClick={() => toggleCheck(workout.id)}
                disabled={isReadOnly}
                className="flex flex-1 items-center gap-4 text-left disabled:cursor-not-allowed"
              >
                {checkedItems.has(workout.id) ? (
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-medium mb-1">{workout.name}</div>
                  <div className="text-sm text-muted-foreground">{workout.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{workout.duration}</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleSwapWorkout(workout.rawId)}
                disabled={isReadOnly || swappingId === workout.id}
                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                title="Đổi bài tập"
              >
                {swappingId === workout.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${isReadOnly ? "grayscale opacity-80" : ""}`}>
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Giấc ngủ</h3>
          </div>
          <button
            onClick={() => toggleCheck(normalizedDayData.sleep.id)}
            disabled={isReadOnly}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border border-border transition-all text-left ${isReadOnly ? "cursor-not-allowed opacity-70" : "hover:border-primary/50"}`}
          >
            {checkedItems.has(normalizedDayData.sleep.id) ? (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-medium mb-1">{normalizedDayData.sleep.target}</div>
              <div className="text-sm text-muted-foreground">{normalizedDayData.sleep.time}</div>
            </div>
          </button>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Uống nước</h3>
          </div>
          <button
            onClick={() => toggleCheck(normalizedDayData.water.id)}
            disabled={isReadOnly}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border border-border transition-all text-left ${isReadOnly ? "cursor-not-allowed opacity-70" : "hover:border-primary/50"}`}
          >
            {checkedItems.has(normalizedDayData.water.id) ? (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-medium mb-1">{normalizedDayData.water.target}</div>
              <div className="text-sm text-muted-foreground">
                {normalizedDayData.water.glasses} ly
              </div>
            </div>
          </button>
        </div>
      </div>

      {showActualCostPrompt ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="mb-3">
            <div className="font-semibold">Chi phí thực tế hôm nay</div>
            <div className="text-sm text-emerald-800">
              Bạn dự kiến chi {normalizedDayData.plannedCost.toLocaleString("vi-VN")} VND. Bạn đã chi bao nhiêu?
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              value={actualCostInput}
              onChange={(event) => setActualCostInput(event.target.value)}
              className="h-11 flex-1 rounded-lg border border-emerald-200 bg-white px-3 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Nhập chi phí thực tế"
            />
            <Button onClick={handleSaveActualCost} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu chi phí"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowActualCostPrompt(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
          </div>
        </div>
      ) : null}

      <Button
        onClick={handleFinishDay}
        className="w-full h-12"
        disabled={isSaving || isReadOnly}
      >
        {isReadOnly ? "Ngày này đã bị khóa" : isSaving
          ? "Đang lưu..."
          : completionPercentage === 100
            ? "Đã hoàn thành ngày này!"
            : "Lưu và quay lại kế hoạch"}
      </Button>
    </div>
  );
}
