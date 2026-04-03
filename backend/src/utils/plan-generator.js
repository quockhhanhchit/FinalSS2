function generateBudgetBreakdown(totalBudget, budgetStyle = "normal") {
  let foodPercent = 0.6;
  let workoutPercent = 0.16;
  let wellnessPercent = 0.14;
  let bufferPercent = 0.1;

  if (budgetStyle === "saving") {
    foodPercent = 0.65;
    workoutPercent = 0.1;
    wellnessPercent = 0.1;
    bufferPercent = 0.15;
  }

  const food = Math.round(totalBudget * foodPercent);
  const workout = Math.round(totalBudget * workoutPercent);
  const wellness = Math.round(totalBudget * wellnessPercent);
  const buffer = Math.round(totalBudget * bufferPercent);

  return {
    food,
    workout,
    wellness,
    buffer,
    totalBudget,
    dailyBudget: Math.round(totalBudget / 30),
  };
}

function getWorkoutType(dayNumber) {
  if (dayNumber % 7 === 0) return "Rest";
  if (dayNumber % 3 === 0) return "Cardio";
  if (dayNumber % 2 === 0) return "Strength";
  return "HIIT";
}

function generatePlanDays(startDate, durationDays, dailyBudget) {
  const days = [];

  for (let i = 1; i <= durationDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i - 1));

    days.push({
      dayNumber: i,
      planDate: date.toISOString().split("T")[0],
      workoutType: getWorkoutType(i),
      plannedCalories: 2000,
      plannedCost: dailyBudget,
      meals: [
        { mealName: "Oatmeal with Banana", mealTime: "7:00 AM", calories: 350, cost: 25000 },
        { mealName: "Grilled Chicken Salad", mealTime: "12:30 PM", calories: 450, cost: 45000 },
        { mealName: "Protein Smoothie", mealTime: "3:00 PM", calories: 300, cost: 30000 },
        { mealName: "Salmon with Vegetables", mealTime: "7:00 PM", calories: 550, cost: 60000 }
      ],
      workouts: [
        { workoutName: "Warm-up", durationMinutes: 10, description: "Light cardio and stretching" },
        { workoutName: "Main Workout", durationMinutes: 45, description: "Targeted routine for the day" },
        { workoutName: "Cool-down", durationMinutes: 10, description: "Stretching and breathing" }
      ]
    });
  }

  return days;
}

module.exports = {
  generateBudgetBreakdown,
  generatePlanDays,
};