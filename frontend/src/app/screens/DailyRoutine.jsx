import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Apple,
  Dumbbell,
  Moon,
  Droplet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { apiGet } from "../lib/api";

export function DailyRoutine() {
  const navigate = useNavigate();
  const { dayId } = useParams();
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [dayData, setDayData] = useState(null);
  const [error, setError] = useState("");

  const dayNumber = Number(dayId || 1);

  useEffect(() => {
    let ignore = false;

    async function loadDay() {
      try {
        const data = await apiGet(`/api/plans/current/day/${dayNumber}`);

        if (!ignore) {
          setDayData(data);
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

  const formattedDate = useMemo(() => {
    const date = dayData?.plan_date ? new Date(dayData.plan_date) : new Date();
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [dayData]);

  const normalizedDayData = useMemo(() => {
    const meals = (dayData?.meals || []).map((meal) => ({
      id: `meal-${meal.id}`,
      name: meal.meal_name,
      calories: Number(meal.calories),
      cost: Number(meal.cost),
      time: meal.meal_time,
    }));

    const workouts = (dayData?.workouts || []).map((workout) => ({
      id: `workout-${workout.id}`,
      name: workout.workout_name,
      duration: `${workout.duration_minutes} min`,
      description: workout.description,
    }));

    return {
      day: dayData?.day_number || dayNumber,
      date: formattedDate,
      workout: dayData?.workout_type || "Workout",
      plannedCalories: Number(dayData?.planned_calories || 0),
      plannedCost: Number(dayData?.planned_cost || 0),
      meals,
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
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const totalChecked = checkedItems.size;
  const totalItems =
    normalizedDayData.meals.length + normalizedDayData.workouts.length + 2;
  const completionPercentage = totalItems
    ? Math.round((totalChecked / totalItems) * 100)
    : 0;

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
          <div className="text-xs text-muted-foreground mt-1">From generated plan</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Apple className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Meals</h3>
          <span className="text-sm text-muted-foreground">
            ({normalizedDayData.meals.filter((m) => checkedItems.has(m.id)).length}/{normalizedDayData.meals.length})
          </span>
        </div>
        <div className="space-y-3">
          {normalizedDayData.meals.map((meal) => (
            <button
              key={meal.id}
              onClick={() => toggleCheck(meal.id)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-all text-left"
            >
              {checkedItems.has(meal.id) ? (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-medium mb-1">{meal.name}</div>
                <div className="text-sm text-muted-foreground">{meal.time}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{meal.calories} kcal</div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(meal.cost / 1000)}k VND
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Workout</h3>
          <span className="text-sm text-muted-foreground">
            ({normalizedDayData.workouts.filter((w) => checkedItems.has(w.id)).length}/{normalizedDayData.workouts.length})
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
        onClick={() => navigate("/app/plan")}
        className="w-full h-12"
        disabled={completionPercentage < 100}
      >
        {completionPercentage === 100 ? "Day Complete!" : "Complete All Tasks First"}
      </Button>
    </div>
  );
}
