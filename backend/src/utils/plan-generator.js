const MEAL_DATASET = {
  breakfast: [
    { name: "Phở gà", calories: 430, cost: 45000 },
    { name: "Bún bò", calories: 520, cost: 50000 },
    { name: "Yến mạch chuối", calories: 350, cost: 28000 },
    { name: "Bánh mì trứng", calories: 390, cost: 32000 },
    { name: "Sữa chua Hy Lạp với trái cây", calories: 320, cost: 35000 },
    { name: "Cháo gà", calories: 380, cost: 30000 },
  ],
  lunch: [
    { name: "Cơm tấm sườn", calories: 650, cost: 60000 },
    { name: "Cơm gà rau củ", calories: 560, cost: 52000 },
    { name: "Bún bò trộn rau", calories: 520, cost: 55000 },
    { name: "Cơm gạo lứt đậu hũ", calories: 480, cost: 42000 },
    { name: "Cơm cá hồi", calories: 620, cost: 85000 },
    { name: "Bún thịt nạc", calories: 540, cost: 48000 },
  ],
  dinner: [
    { name: "Gà nướng khoai lang", calories: 520, cost: 55000 },
    { name: "Bò xào bông cải", calories: 580, cost: 70000 },
    { name: "Cá áp chảo với cơm", calories: 560, cost: 65000 },
    { name: "Mì Ý thịt nạc", calories: 610, cost: 62000 },
    { name: "Canh đậu hũ trứng rau củ", calories: 430, cost: 38000 },
    { name: "Cuốn salad gà", calories: 460, cost: 45000 },
  ],
  snack: [
    { name: "Sữa chua Hy Lạp", calories: 180, cost: 22000 },
    { name: "Hộp trái cây", calories: 160, cost: 25000 },
    { name: "Sinh tố whey protein", calories: 240, cost: 35000 },
    { name: "Trứng luộc", calories: 150, cost: 12000 },
    { name: "Bánh mì bơ đậu phộng", calories: 260, cost: 18000 },
    { name: "Sữa và chuối", calories: 230, cost: 20000 },
  ],
};

const WORKOUTS = {
  home: {
    HIIT: [
      "Nhảy jumping jack",
      "Chạy nâng cao đùi",
      "Burpees",
      "Bật nhảy squat",
      "Leo núi tại chỗ",
    ],
    Cardio: [
      "Aerobic cơ bản",
      "Đi bộ nhanh quanh nhà",
      "Leo cầu thang bộ",
      "Cardio nhẹ ít tác động",
    ],
    Strength: [
      "Chống đẩy",
      "Squat tay không",
      "Gập bụng",
      "Plank",
      "Nâng hông",
    ],
  },
  gym: {
    HIIT: [
      "Chạy máy biến tốc",
      "Nước rút trên xe đạp spin",
      "Chèo thuyền biến tốc",
      "Battle rope ngắt quãng",
    ],
    Cardio: [
      "Đi bộ dốc trên máy chạy bộ",
      "Đạp xe tốc độ đều",
      "Máy leo cầu thang",
      "Máy elliptical",
    ],
    Strength: [
      "Đẩy ngực với tạ đòn",
      "Squat với tạ đòn",
      "Kéo xà",
      "Đẩy vai với tạ đơn",
      "Kéo xô máy",
    ],
  },
};

const CALORIE_BOUNDARIES = {
  male: {
    maintain: { min: 2200, max: 2800 },
    lose: { min: 1900, max: 2300 },
    gain: { min: 2500, max: 3300 },
  },
  female: {
    maintain: { min: 1800, max: 2200 },
    lose: { min: 1400, max: 1800 },
    gain: { min: 2100, max: 2700 },
  },
};

const CALORIE_TARGETS = {
  male: {
    maintain: 2500,
    lose: 2100,
    gain: 2900,
  },
  female: {
    maintain: 2000,
    lose: 1600,
    gain: 2400,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toLocalDateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function localizeMealName(name) {
  const translations = {
    "Pho ga": "Phở gà",
    "Bun bo": "Bún bò",
    "Oatmeal with Banana": "Yến mạch chuối",
    "Egg Sandwich": "Bánh mì trứng",
    "Greek Yogurt Bowl": "Sữa chua Hy Lạp với trái cây",
    "Chicken Congee": "Cháo gà",
    "Com tam suon": "Cơm tấm sườn",
    "Chicken Rice with Vegetables": "Cơm gà rau củ",
    "Beef Noodle Salad": "Bún bò trộn rau",
    "Tofu Brown Rice Bowl": "Cơm gạo lứt đậu hũ",
    "Salmon Rice Bowl": "Cơm cá hồi",
    "Lean Pork Vermicelli": "Bún thịt nạc",
    "Grilled Chicken Sweet Potato": "Gà nướng khoai lang",
    "Stir-fried Beef and Broccoli": "Bò xào bông cải",
    "Pan-seared Fish with Rice": "Cá áp chảo với cơm",
    "Turkey Pasta": "Mì Ý thịt nạc",
    "Egg Tofu Vegetable Soup": "Canh đậu hũ trứng rau củ",
    "Chicken Salad Wrap": "Cuốn salad gà",
    "Greek Yogurt": "Sữa chua Hy Lạp",
    "Fruit Box": "Hộp trái cây",
    "Whey Protein Shake": "Sinh tố whey protein",
    "Boiled Eggs": "Trứng luộc",
    "Peanut Butter Toast": "Bánh mì bơ đậu phộng",
    "Milk and Banana": "Sữa và chuối",
  };

  return String(name || "")
    .replace(/^Large /, "Phần lớn ")
    .replace(/^Small /, "Phần nhỏ ")
    .replace(
      /(Pho ga|Bun bo|Oatmeal with Banana|Egg Sandwich|Greek Yogurt Bowl|Chicken Congee|Com tam suon|Chicken Rice with Vegetables|Beef Noodle Salad|Tofu Brown Rice Bowl|Salmon Rice Bowl|Lean Pork Vermicelli|Grilled Chicken Sweet Potato|Stir-fried Beef and Broccoli|Pan-seared Fish with Rice|Turkey Pasta|Egg Tofu Vegetable Soup|Chicken Salad Wrap|Greek Yogurt|Fruit Box|Whey Protein Shake|Boiled Eggs|Peanut Butter Toast|Milk and Banana)/,
      (match) => translations[match] || match
    );
}

function localizeWorkoutName(name) {
  const translations = {
    "Jumping Jacks": "Nhảy jumping jack",
    "High Knees": "Chạy nâng cao đùi",
    Burpees: "Burpees",
    "Squat Jumps": "Bật nhảy squat",
    "Mountain Climbers": "Leo núi tại chỗ",
    "Basic Aerobics": "Aerobic cơ bản",
    "Fast Walk Around Home": "Đi bộ nhanh quanh nhà",
    "Stair Climbing": "Leo cầu thang bộ",
    "Low-impact Cardio Flow": "Cardio nhẹ ít tác động",
    "Push-ups": "Chống đẩy",
    "Bodyweight Squats": "Squat tay không",
    Crunches: "Gập bụng",
    Plank: "Plank",
    "Glute Bridges": "Nâng hông",
    "Treadmill Intervals": "Chạy máy biến tốc",
    "Spin Bike Sprints": "Nước rút trên xe đạp spin",
    "Rowing Machine Intervals": "Chèo thuyền biến tốc",
    "Battle Rope Intervals": "Battle rope ngắt quãng",
    "Incline Treadmill Walk": "Đi bộ dốc trên máy chạy bộ",
    "Steady Bike Ride": "Đạp xe tốc độ đều",
    Stairmaster: "Máy leo cầu thang",
    "Elliptical Trainer": "Máy elliptical",
    "Bench Press": "Đẩy ngực với tạ đòn",
    "Barbell Squat": "Squat với tạ đòn",
    "Pull-ups": "Kéo xà",
    "Dumbbell Press": "Đẩy vai với tạ đơn",
    "Lat Pulldown": "Kéo xô máy",
    "Active Recovery Walk": "Đi bộ phục hồi",
    "Mobility Flow": "Chuỗi vận động linh hoạt",
    "Deep Stretching": "Giãn cơ sâu",
    "Breathing Reset": "Thở phục hồi",
    "Warm-up": "Khởi động",
    "Cool-down": "Thả lỏng",
  };

  return translations[name] || name;
}

function localizeWorkoutDescription(description) {
  const translations = {
    "Easy walk to keep the body moving": "Đi bộ nhẹ để cơ thể duy trì vận động",
    "Gentle joint mobility and dynamic stretching": "Vận động khớp nhẹ và giãn cơ động",
    "Slow full-body stretching for recovery": "Giãn cơ toàn thân chậm để phục hồi",
    "Low-intensity breathing and relaxation": "Hít thở và thư giãn cường độ thấp",
    "Light cardio and dynamic stretching": "Cardio nhẹ và giãn cơ động",
    "Stretching and breathing": "Giãn cơ và hít thở",
  };

  return translations[description] || description;
}

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
  const gender = profile.gender === "female" ? "female" : "male";
  const goal = ["lose", "maintain", "gain"].includes(profile.goal_type)
    ? profile.goal_type
    : "maintain";
  const targetBoundary = CALORIE_BOUNDARIES[gender][goal];
  const targetCalories = CALORIE_TARGETS[gender][goal];

  return clamp(targetCalories, targetBoundary.min, targetBoundary.max);
}

function calculateBudgetTier(monthlyBudget) {
  const budget = Number(monthlyBudget || 0);

  if (budget >= 5000000) return "premium";
  if (budget >= 3000000) return "normal";
  return "saving";
}

function getMealPlanTemplate(mealsPerDay) {
  if (mealsPerDay <= 3) {
    return [
      { type: "breakfast", label: "Breakfast", time: "7:00 AM", ratio: 0.3 },
      { type: "lunch", label: "Lunch", time: "12:30 PM", ratio: 0.35 },
      { type: "dinner", label: "Dinner", time: "19:00", ratio: 0.35 },
    ];
  }

  if (mealsPerDay === 4) {
    return [
      { type: "breakfast", label: "Breakfast", time: "7:00 AM", ratio: 0.25 },
      { type: "lunch", label: "Lunch", time: "12:30 PM", ratio: 0.3 },
      { type: "snack", label: "Snack", time: "3:30 PM", ratio: 0.15 },
      { type: "dinner", label: "Dinner", time: "19:00", ratio: 0.3 },
    ];
  }

  return [
    { type: "breakfast", label: "Breakfast", time: "7:00 AM", ratio: 0.22 },
    { type: "snack", label: "Snack 1", time: "10:00 AM", ratio: 0.13 },
    { type: "lunch", label: "Lunch", time: "12:30 PM", ratio: 0.28 },
    { type: "snack", label: "Snack 2", time: "3:30 PM", ratio: 0.12 },
    { type: "dinner", label: "Dinner", time: "19:00", ratio: 0.25 },
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

  return {
    mealName: localizeMealName(baseMeal.name),
    mealTime: `${slotIndex + 1}. ${slotIndex === 0 ? "Breakfast" : ""}`.trim(),
    calories: Number(baseMeal.calories),
    cost: Number(baseMeal.cost),
  };
}

async function fetchMealFromLibrary(
  executor,
  profile,
  type,
  dayNumber,
  slotIndex,
  targetCalories,
  targetCost
) {
  const goalType = ["lose", "maintain", "gain"].includes(profile.goal_type)
    ? profile.goal_type
    : "maintain";
  const budgetTier = calculateBudgetTier(profile.budget_total);
  const [rows] = await executor.query(
    `SELECT id, meal_name, calories, estimated_cost
     FROM meal_library
     WHERE is_active = true
       AND goal_type = ?
       AND budget_tier = ?
       AND meal_type = ?
     ORDER BY
       ABS(calories - ?) + ABS(estimated_cost - ?) / 150 ASC,
       RAND()
     LIMIT 8`,
    [goalType, budgetTier, type, targetCalories, targetCost]
  );

  if (rows.length === 0) {
    const [fallbackRows] = await executor.query(
      `SELECT id, meal_name, calories, estimated_cost
       FROM meal_library
       WHERE is_active = true
         AND goal_type = ?
         AND meal_type = ?
       ORDER BY
         ABS(calories - ?) + ABS(estimated_cost - ?) / 150 ASC,
         RAND()
       LIMIT 8`,
      [goalType, type, targetCalories, targetCost]
    );

    if (fallbackRows.length === 0) {
      return null;
    }

    rows.push(fallbackRows[0]);
  }

  const selected = rows[Math.floor(Math.random() * Math.min(rows.length, 4))];

  return {
    mealLibraryId: selected.id,
    mealName: localizeMealName(selected.meal_name),
    calories: Number(selected.calories),
    cost: Number(selected.estimated_cost),
  };
}

async function buildMeals(executor, profile, dayNumber, targetCalories, dailyFoodBudget) {
  const mealsPerDay = Math.min(Math.max(Number(profile.meals_per_day || 3), 3), 5);
  const template = getMealPlanTemplate(mealsPerDay);

  return Promise.all(template.map(async (slot, index) => {
    const targetMealCalories = targetCalories * slot.ratio;
    const targetMealCost = dailyFoodBudget * slot.ratio;
    const libraryMeal = await fetchMealFromLibrary(
      executor,
      profile,
      slot.type,
      dayNumber,
      index,
      targetMealCalories,
      targetMealCost
    );
    const meal = libraryMeal || pickMeal(
      slot.type,
      dayNumber,
      index,
      targetMealCalories,
      targetMealCost
    );

    return {
      ...meal,
      mealLibraryId: meal.mealLibraryId || null,
      mealTime: `${slot.label} - ${slot.time}`,
    };
  }));
}

function getWorkoutType(dayNumber, goalType) {
  if (dayNumber % 7 === 0) return "Rest";

  if (dayNumber % 4 === 0) return "HIIT";

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

function calculateWorkoutDurationMinutes(workoutType, suggestedVolume = "") {
  const volume = String(suggestedVolume || "").toLowerCase();
  const hasExplicitMinutes =
    /\b\d+\s*-\s*\d+\s*min\b/.test(volume) || /\b\d+\s*min\b/.test(volume);

  if (hasExplicitMinutes) {
    const rangeMatch = volume.match(/\b(\d+)\s*-\s*(\d+)\s*min\b/);

    if (rangeMatch) {
      const parsedMinutes = Math.round(
        (Number(rangeMatch[1]) + Number(rangeMatch[2])) / 2
      );

      return workoutType === "cardio" || workoutType === "strength"
        ? Math.min(parsedMinutes, 15)
        : parsedMinutes;
    }

    const minuteMatch = volume.match(/\b(\d+)\s*min\b/);

    if (minuteMatch) {
      const parsedMinutes = Number(minuteMatch[1]);

      return workoutType === "cardio" || workoutType === "strength"
        ? Math.min(parsedMinutes, 15)
        : parsedMinutes;
    }
  }

  const hasSetRepPattern =
    /\b\d+\s*(x|sets?)\s*\d+/.test(volume) ||
    /\b\d+\s*-\s*\d+\s*reps?\b/.test(volume) ||
    volume.includes("mỗi bên");

  if (hasSetRepPattern) {
    return 12;
  }

  if (workoutType === "rest") return 15;
  if (workoutType === "hiit") return 20;

  return 15;
}

async function fetchWorkoutsFromLibrary(executor, profile, dayNumber, workoutType) {
  const gender = profile.gender === "female" ? "female" : "male";
  const location = profile.workout_location === "gym" ? "gym" : "home";
  const preferredType = workoutType === "HIIT"
    ? "hiit"
    : workoutType === "Strength"
      ? "strength"
      : workoutType === "Cardio"
        ? "cardio"
        : "rest";
  const [rows] = await executor.query(
    `SELECT id, workout_type, workout_name, suggested_volume, notes
     FROM workout_library
     WHERE is_active = true
       AND workout_type = ?
       AND location = ?
       AND (gender_target = ? OR gender_target = 'both')
     ORDER BY RAND()
     LIMIT 5`,
    [preferredType, location, gender]
  );

  return rows.map((selected) => ({
    workoutLibraryId: selected.id,
    workoutName: localizeWorkoutName(selected.workout_name),
    durationMinutes: calculateWorkoutDurationMinutes(
      preferredType,
      selected.suggested_volume
    ),
    description: selected.suggested_volume || selected.notes || selected.workout_type,
  }));
}

async function buildWorkouts(executor, profile, dayNumber, workoutType) {
  const libraryWorkouts = await fetchWorkoutsFromLibrary(
    executor,
    profile,
    dayNumber,
    workoutType
  );

  if (libraryWorkouts.length >= 4) {
    return [
      {
        workoutLibraryId: null,
        workoutName: "Khởi động",
        durationMinutes: 10,
        description: "Cardio nhẹ và giãn cơ động",
      },
      ...libraryWorkouts.slice(0, 5),
      {
        workoutLibraryId: null,
        workoutName: "Thả lỏng",
        durationMinutes: 10,
        description: "Giãn cơ và hít thở",
      },
    ];
  }

  if (workoutType === "Rest") {
    return [
      {
        workoutLibraryId: null,
        workoutName: "Đi bộ phục hồi",
        durationMinutes: 20,
        description: "Đi bộ nhẹ để cơ thể duy trì vận động",
      },
      {
        workoutLibraryId: null,
        workoutName: "Chuỗi vận động linh hoạt",
        durationMinutes: 10,
        description: "Vận động khớp nhẹ và giãn cơ động",
      },
      {
        workoutLibraryId: null,
        workoutName: "Giãn cơ sâu",
        durationMinutes: 10,
        description: "Giãn cơ toàn thân chậm để phục hồi",
      },
      {
        workoutLibraryId: null,
        workoutName: "Thở phục hồi",
        durationMinutes: 5,
        description: "Hít thở và thư giãn cường độ thấp",
      },
    ];
  }

  const location = profile.workout_location === "gym" ? "gym" : "home";
  const options = WORKOUTS[location][workoutType];
  const mainWorkouts = options
    .map((name, index) => options[(dayNumber + index) % options.length])
    .slice(0, 4);

  return [
    {
      workoutLibraryId: null,
      workoutName: "Khởi động",
      durationMinutes: 10,
      description: "Cardio nhẹ và giãn cơ động",
    },
    ...mainWorkouts.map((name) => ({
      workoutLibraryId: null,
      workoutName: localizeWorkoutName(name),
      durationMinutes: workoutType === "HIIT" ? 20 : 35,
      description: `Buổi ${workoutType} phù hợp để tập ${location === "gym" ? "ở phòng gym" : "tại nhà"}`,
    })),
    {
      workoutLibraryId: null,
      workoutName: "Thả lỏng",
      durationMinutes: 10,
      description: "Giãn cơ và hít thở",
    },
  ];
}

async function generatePlanDays(executor, startDate, profile, budget) {
  const days = [];
  const durationDays = Number(profile.duration_days || 30);
  const targetCalories = calculateTargetCalories(profile);
  const dailyFoodBudget = Number(budget.dailyFoodBudget || budget.food / 30 || 0);
  const dailyBudget = Number(budget.dailyBudget || 0);

  for (let i = 1; i <= durationDays; i += 1) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i - 1));

    const workoutType = getWorkoutType(i, profile.goal_type);
    const meals = await buildMeals(executor, profile, i, targetCalories, dailyFoodBudget);
    const workouts = await buildWorkouts(executor, profile, i, workoutType);
    const plannedMealCost = meals.reduce((sum, meal) => sum + meal.cost, 0);

    days.push({
      dayNumber: i,
      planDate: toLocalDateKey(date),
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
  calculateBudgetTier,
  toLocalDateKey,
  localizeMealName,
  localizeWorkoutName,
  localizeWorkoutDescription,
  calculateWorkoutDurationMinutes,
};
