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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { apiGet, apiPut } from "../lib/api";

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

function MealGroup({
  title,
  subtitle,
  icon: Icon,
  gradient,
  hoverBorder,
  meals,
  checkedItems,
  onToggle,
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
            <button
              onClick={() => onToggle(meal.id)}
              className={`relative w-full flex items-start gap-4 p-4 rounded-xl border border-border ${hoverBorder} transition-all text-left`}
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

    return () => {
      ignore = true;
    };
  }, [dayNumber]);

  async function saveProgress(taskIds, options = {}) {
    if (!dayData) {
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
        response?.completed ? "Day completed and saved." : "Progress saved.",
      );
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
    if (!dayData) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      saveProgress(checkedItems);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [checkedItems, dayData]);

  const formattedDate = useMemo(() => {
    const date = dayData?.plan_date ? new Date(dayData.plan_date) : new Date();
    return date.toLocaleDateString("en-US", {
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
        name: meal.meal_name,
        calories: Number(meal.calories),
        cost: Number(meal.cost),
        time: meal.meal_time,
      });
    });

    const workouts = (dayData?.workouts || []).map((workout) => ({
      id: `workout-${workout.id}`,
      name: workout.workout_name,
      duration: `${workout.duration_minutes} min`,
      durationMinutes: Number(workout.duration_minutes || 0),
      description: workout.description,
    }));

    return {
      day: dayData?.day_number || dayNumber,
      date: formattedDate,
      workout: dayData?.workout_type || "Workout",
      plannedCalories: Number(dayData?.planned_calories || 0),
      plannedCost: Number(dayData?.planned_cost || 0),
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
        ...(dayData?.sleep || { target: "8 hours", time: "10:00 PM - 6:00 AM" }),
      },
      water: {
        id: "water",
        ...(dayData?.water || { target: "2.5 liters", glasses: 10 }),
      },
    };
  }, [dayData, dayNumber, formattedDate]);

  const toggleCheck = (id) => {
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

  const handleFinishDay = async () => {
    const wasSaved = await saveProgress(checkedItems, { force: true });

    if (wasSaved) {
      navigate("/app/plan");
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
          <h1 className="text-3xl font-semibold mb-1">Day {normalizedDayData.day}</h1>
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

      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Daily Progress</div>
            <div className="text-3xl font-bold">{completionPercentage}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground mb-1">Tasks Completed</div>
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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Planned Calories</div>
          <div className="text-2xl font-bold">{normalizedDayData.plannedCalories}</div>
          <div className="text-xs text-muted-foreground mt-1">kcal</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Planned Cost</div>
          <div className="text-2xl font-bold">
            {Math.round(normalizedDayData.plannedCost / 1000)}k
          </div>
          <div className="text-xs text-muted-foreground mt-1">VND</div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="text-sm text-muted-foreground mb-1">Workout Type</div>
          <div className="text-lg font-bold">{normalizedDayData.workout}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {workoutDuration} min total
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Cookie className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Nutrition Plan</h3>
          <span className="text-sm text-muted-foreground">
            ({normalizedDayData.allMeals.filter((meal) => checkedItems.has(meal.id)).length}/{normalizedDayData.allMeals.length} meals)
          </span>
        </div>

        <div className="space-y-6">
          <MealGroup
            title="Breakfast"
            icon={Sunrise}
            gradient="from-amber-400 to-orange-500"
            hoverBorder="hover:border-amber-500/50"
            meals={normalizedDayData.meals.breakfast}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
          />
          <MealGroup
            title="Lunch"
            icon={Sun}
            gradient="from-emerald-400 to-teal-500"
            hoverBorder="hover:border-teal-500/50"
            meals={normalizedDayData.meals.lunch}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
          />
          <MealGroup
            title="Dinner"
            icon={Sunset}
            gradient="from-purple-400 to-violet-500"
            hoverBorder="hover:border-purple-500/50"
            meals={normalizedDayData.meals.dinner}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
          />
          <MealGroup
            title="Snacks"
            icon={Cookie}
            gradient="from-pink-400 to-rose-500"
            hoverBorder="hover:border-pink-500/50"
            meals={normalizedDayData.meals.snacks}
            checkedItems={checkedItems}
            onToggle={toggleCheck}
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Workout</h3>
          <span className="text-sm text-muted-foreground">
            ({normalizedDayData.workouts.filter((workout) => checkedItems.has(workout.id)).length}/{normalizedDayData.workouts.length})
          </span>
        </div>
        <div className="space-y-3">
          {normalizedDayData.workouts.map((workout) => (
            <button
              key={workout.id}
              onClick={() => toggleCheck(workout.id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all text-left"
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
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Sleep</h3>
          </div>
          <button
            onClick={() => toggleCheck(normalizedDayData.sleep.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all text-left"
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
            <h3 className="text-lg font-semibold">Water</h3>
          </div>
          <button
            onClick={() => toggleCheck(normalizedDayData.water.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all text-left"
          >
            {checkedItems.has(normalizedDayData.water.id) ? (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-medium mb-1">{normalizedDayData.water.target}</div>
              <div className="text-sm text-muted-foreground">
                {normalizedDayData.water.glasses} glasses
              </div>
            </div>
          </button>
        </div>
      </div>

      <Button
        onClick={handleFinishDay}
        className="w-full h-12"
        disabled={isSaving}
      >
        {isSaving
          ? "Saving..."
          : completionPercentage === 100
            ? "Day Complete!"
            : "Save & Return to Plan"}
      </Button>
    </div>
  );
}
