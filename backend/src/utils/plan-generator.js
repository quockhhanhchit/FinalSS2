const MEAL_DATASET = {
  breakfast: [
    { name: "Pho ga", calories: 430, cost: 45000 },
    { name: "Bun bo", calories: 520, cost: 50000 },
    { name: "Oatmeal with Banana", calories: 350, cost: 28000 },
    { name: "Egg Sandwich", calories: 390, cost: 32000 },
    { name: "Greek Yogurt Bowl", calories: 320, cost: 35000 },
    { name: "Chicken Congee", calories: 380, cost: 30000 },
  ],
  lunch: [
    { name: "Com tam suon", calories: 650, cost: 60000 },
    { name: "Chicken Rice with Vegetables", calories: 560, cost: 52000 },
    { name: "Beef Noodle Salad", calories: 520, cost: 55000 },
    { name: "Tofu Brown Rice Bowl", calories: 480, cost: 42000 },
    { name: "Salmon Rice Bowl", calories: 620, cost: 85000 },
    { name: "Lean Pork Vermicelli", calories: 540, cost: 48000 },
  ],
  dinner: [
    { name: "Grilled Chicken Sweet Potato", calories: 520, cost: 55000 },
    { name: "Stir-fried Beef and Broccoli", calories: 580, cost: 70000 },
    { name: "Pan-seared Fish with Rice", calories: 560, cost: 65000 },
    { name: "Turkey Pasta", calories: 610, cost: 62000 },
    { name: "Egg Tofu Vegetable Soup", calories: 430, cost: 38000 },
    { name: "Chicken Salad Wrap", calories: 460, cost: 45000 },
  ],
  snack: [
    { name: "Greek Yogurt", calories: 180, cost: 22000 },
    { name: "Fruit Box", calories: 160, cost: 25000 },
    { name: "Whey Protein Shake", calories: 240, cost: 35000 },
    { name: "Boiled Eggs", calories: 150, cost: 12000 },
    { name: "Peanut Butter Toast", calories: 260, cost: 18000 },
    { name: "Milk and Banana", calories: 230, cost: 20000 },
  ],
};

const WORKOUTS = {
  home: {
    HIIT: [
      "Jumping Jacks",
      "High Knees",
      "Burpees",
      "Squat Jumps",
      "Mountain Climbers",
    ],
    Cardio: [
      "Basic Aerobics",
      "Fast Walk Around Home",
      "Stair Climbing",
      "Low-impact Cardio Flow",
    ],
    Strength: [
      "Push-ups",
      "Bodyweight Squats",
      "Crunches",
      "Plank",
      "Glute Bridges",
    ],
  },
  gym: {
    HIIT: [
      "Treadmill Intervals",
      "Spin Bike Sprints",
      "Rowing Machine Intervals",
      "Battle Rope Intervals",
    ],
    Cardio: [
      "Incline Treadmill Walk",
      "Steady Bike Ride",
      "Stairmaster",
      "Elliptical Trainer",
    ],
    Strength: [
      "Bench Press",
      "Barbell Squat",
      "Pull-ups",
      "Dumbbell Press",
      "Lat Pulldown",
    ],
  },
};

function generateBudgetBreakdown(
  totalBudget,
  budgetStyle = "normal",
  workoutLocation = "gym"
) {
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

  if (workoutLocation !== "gym") {
    const workoutReallocation = workoutPercent;
    workoutPercent = 0;
    foodPercent += workoutReallocation * 0.6;
    wellnessPercent += workoutReallocation * 0.25;
    bufferPercent += workoutReallocation * 0.15;
  }

  const food = Math.round(totalBudget * foodPercent);
  const workout = Math.round(totalBudget * workoutPercent);
  const wellness = Math.round(totalBudget * wellnessPercent);
  const buffer = totalBudget - food - workout - wellness;

  return {
    food,
    workout,
    wellness,
    buffer,
    totalBudget,
    dailyBudget: Math.round(totalBudget / 30),
    dailyFoodBudget: Math.round(food / 30),
  };
}

function calculateTargetCalories(profile) {
  const age = Math.max(Number(profile.age || 25), 1);
  const weight = Math.max(Number(profile.weight_kg || 65), 1);
  const height = Math.max(Number(profile.height_cm || 170), 1);
  const genderOffset =
    profile.gender === "female" ? -161 : profile.gender === "other" ? -78 : 5;
  const bmr = 10 * weight + 6.25 * height - 5 * age + genderOffset;
  const tdee = Math.round(bmr * 1.45);

  if (profile.goal_type === "lose") {
    return Math.max(1400, tdee - 500);
  }

  if (profile.goal_type === "gain") {
    return tdee + 500;
  }

  return tdee;
}

function getMealPlanTemplate(mealsPerDay) {
  if (mealsPerDay <= 3) {
    return [
      { type: "breakfast", label: "Breakfast", time: "7:00 AM", ratio: 0.3 },
      { type: "lunch", label: "Lunch", time: "12:30 PM", ratio: 0.35 },
      { type: "dinner", label: "Dinner", time: "7:00 PM", ratio: 0.35 },
    ];
  }

  if (mealsPerDay === 4) {
    return [
      { type: "breakfast", label: "Breakfast", time: "7:00 AM", ratio: 0.25 },
      { type: "lunch", label: "Lunch", time: "12:30 PM", ratio: 0.3 },
      { type: "snack", label: "Snack", time: "3:30 PM", ratio: 0.15 },
      { type: "dinner", label: "Dinner", time: "7:00 PM", ratio: 0.3 },
    ];
  }

  return [
    { type: "breakfast", label: "Breakfast", time: "7:00 AM", ratio: 0.22 },
    { type: "snack", label: "Snack 1", time: "10:00 AM", ratio: 0.13 },
    { type: "lunch", label: "Lunch", time: "12:30 PM", ratio: 0.28 },
    { type: "snack", label: "Snack 2", time: "3:30 PM", ratio: 0.12 },
    { type: "dinner", label: "Dinner", time: "7:00 PM", ratio: 0.25 },
  ];
}

function pickMeal(type, dayNumber, slotIndex, targetCalories, targetCost) {
  const meals = MEAL_DATASET[type];
  const scoredMeals = meals
    .map((meal) => ({
      meal,
      score:
        Math.abs(meal.calories - targetCalories) +
        Math.abs(meal.cost - targetCost) / 150,
    }))
    .sort((a, b) => a.score - b.score);
  const pickIndex = (dayNumber + slotIndex) % Math.min(scoredMeals.length, 3);
  const baseMeal = scoredMeals[pickIndex].meal;
  const calories = Math.round(targetCalories);
  const cost = Math.round(Math.min(targetCost, baseMeal.cost * 1.25));

  let sizePrefix = "";
  if (calories > 600) {
    sizePrefix = "Large ";
  } else if (calories < 400) {
    sizePrefix = "Small ";
  }

  return {
    mealName: `${sizePrefix}${baseMeal.name}`,
    mealTime: `${slotIndex + 1}. ${slotIndex === 0 ? "Breakfast" : ""}`.trim(),
    calories,
    cost,
  };
}

function buildMeals(profile, dayNumber, targetCalories, dailyFoodBudget) {
  const mealsPerDay = Math.min(Math.max(Number(profile.meals_per_day || 3), 3), 5);
  const template = getMealPlanTemplate(mealsPerDay);

  return template.map((slot, index) => {
    const meal = pickMeal(
      slot.type,
      dayNumber,
      index,
      targetCalories * slot.ratio,
      dailyFoodBudget * slot.ratio
    );

    return {
      ...meal,
      mealTime: `${slot.label} - ${slot.time}`,
    };
  });
}

function getWorkoutType(dayNumber, goalType) {
  if (dayNumber % 7 === 0) return "Rest";

  if (goalType === "gain") {
    if (dayNumber % 3 === 0) return "Cardio";
    return "Strength";
  }

  if (goalType === "lose") {
    if (dayNumber % 3 === 0) return "Strength";
    return dayNumber % 2 === 0 ? "HIIT" : "Cardio";
  }

  if (dayNumber % 3 === 0) return "Cardio";
  if (dayNumber % 2 === 0) return "Strength";
  return "HIIT";
}

function buildWorkouts(profile, dayNumber, workoutType) {
  if (workoutType === "Rest") {
    return [
      {
        workoutName: "Active Recovery",
        durationMinutes: 25,
        description: "Easy walk, mobility, and light stretching",
      },
    ];
  }

  const location = profile.workout_location === "gym" ? "gym" : "home";
  const options = WORKOUTS[location][workoutType];
  const mainA = options[dayNumber % options.length];
  const mainB = options[(dayNumber + 2) % options.length];

  return [
    {
      workoutName: "Warm-up",
      durationMinutes: 10,
      description: "Light cardio and dynamic stretching",
    },
    {
      workoutName: mainA,
      durationMinutes: workoutType === "HIIT" ? 20 : 35,
      description: `${workoutType} session designed for ${location} training`,
    },
    {
      workoutName: mainB,
      durationMinutes: workoutType === "Strength" ? 25 : 15,
      description: `Secondary ${workoutType.toLowerCase()} movement`,
    },
    {
      workoutName: "Cool-down",
      durationMinutes: 10,
      description: "Stretching and breathing",
    },
  ];
}

function generatePlanDays(startDate, profile, budget) {
  const days = [];
  const durationDays = Number(profile.duration_days || 30);
  const targetCalories = calculateTargetCalories(profile);
  const dailyFoodBudget = Number(budget.dailyFoodBudget || budget.food / 30 || 0);
  const dailyBudget = Number(budget.dailyBudget || 0);

  for (let i = 1; i <= durationDays; i += 1) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i - 1));

    const workoutType = getWorkoutType(i, profile.goal_type);
    const meals = buildMeals(profile, i, targetCalories, dailyFoodBudget);
    const workouts = buildWorkouts(profile, i, workoutType);
    const plannedMealCost = meals.reduce((sum, meal) => sum + meal.cost, 0);

    days.push({
      dayNumber: i,
      planDate: date.toISOString().split("T")[0],
      workoutType,
      plannedCalories: targetCalories,
      plannedCost: plannedMealCost,
      meals,
      workouts,
    });
  }

  return days;
}

module.exports = {
  generateBudgetBreakdown,
  generatePlanDays,
  calculateTargetCalories,
};
