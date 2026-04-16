const pool = require("../config/db");
const {
  calculateBudgetTier,
  generateBudgetBreakdown,
  generatePlanDays,
  calculateWorkoutDurationMinutes,
  localizeMealName,
  localizeWorkoutDescription,
  localizeWorkoutName,
  toLocalDateKey,
} = require("../utils/plan-generator");

function normalizeWorkoutType(value) {
  const type = String(value || "").toLowerCase();

  if (type === "hiit") return "hiit";
  if (type === "strength") return "strength";
  if (type === "cardio") return "cardio";
  return "rest";
}

function getMealTypeFromMealTime(mealTime = "") {
  const value = String(mealTime).toLowerCase();

  if (value.includes("breakfast") || value.includes("sáng")) return "breakfast";
  if (value.includes("lunch") || value.includes("trưa")) return "lunch";
  if (value.includes("dinner") || value.includes("tối")) return "dinner";
  return "snack";
}

async function getActivePlanForUser(executor, userId) {
  const [plans] = await executor.query(
    `SELECT * FROM plans
     WHERE user_id = ? AND status = 'active'
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [userId]
  );

  return plans[0] || null;
}

async function getPlanDayRecord(executor, planId, dayNumber) {
  const [days] = await executor.query(
    `SELECT * FROM plan_days
     WHERE plan_id = ? AND day_number = ?`,
    [planId, dayNumber]
  );

  return days[0] || null;
}

async function getPlanDayDetails(executor, planDayId) {
  const [meals] = await executor.query(
    `SELECT
       m.*,
       COALESCE(ml.meal_name, m.meal_name) AS meal_name,
       COALESCE(ml.calories, m.calories) AS calories,
       COALESCE(ml.estimated_cost, m.cost) AS cost
     FROM meals m
     LEFT JOIN meal_library ml ON ml.id = m.meal_library_id
     WHERE m.plan_day_id = ?
     ORDER BY m.id ASC`,
    [planDayId]
  );
  const [workouts] = await executor.query(
    `SELECT
       w.*,
       COALESCE(wl.workout_name, w.workout_name) AS workout_name,
       COALESCE(wl.suggested_volume, w.description) AS description,
       wl.suggested_volume AS library_suggested_volume,
       wl.workout_type AS library_workout_type
     FROM workouts w
     LEFT JOIN workout_library wl ON wl.id = w.workout_library_id
     WHERE w.plan_day_id = ?
     ORDER BY w.id ASC`,
    [planDayId]
  );
  const [completions] = await executor.query(
    `SELECT task_type, task_ref_id
     FROM daily_task_completions
     WHERE plan_day_id = ? AND is_completed = true`,
    [planDayId]
  );

  const completedTasks = completions.map((completion) => {
    if (completion.task_type === "sleep" || completion.task_type === "water") {
      return completion.task_type;
    }

    return `${completion.task_type}-${completion.task_ref_id}`;
  });

  return {
    meals: meals.map((meal) => ({
      ...meal,
      meal_name: localizeMealName(meal.meal_name),
    })),
    workouts: workouts.map((workout) => ({
      ...workout,
      workout_name: localizeWorkoutName(workout.workout_name),
      duration_minutes: workout.library_workout_type
        ? calculateWorkoutDurationMinutes(
            workout.library_workout_type,
            workout.library_suggested_volume
          )
        : workout.duration_minutes,
      description: localizeWorkoutDescription(workout.description),
    })),
    completedTasks,
  };
}

async function getProfileForUser(executor, userId) {
  const [profiles] = await executor.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  if (profiles.length === 0) {
    throw new Error("Profile not found. Complete onboarding first.");
  }

  return profiles[0];
}

async function getActivePlanDayForUser(executor, userId, dayNumber) {
  const plan = await getActivePlanForUser(executor, userId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  const day = await getPlanDayRecord(executor, plan.id, dayNumber);

  if (!day) {
    throw new Error("Plan day not found");
  }

  return { plan, day };
}

function toDateKey(value) {
  return toLocalDateKey(value);
}

function getTodayKey() {
  return toLocalDateKey(new Date());
}

function getDayLockState(day) {
  const isPastDay = toDateKey(day.plan_date) < getTodayKey();

  if (!isPastDay) {
    return {
      isLocked: false,
      lockReason: null,
    };
  }

  return {
    isLocked: true,
    lockReason: day.completed
      ? "Ngày này đã hoàn thành và đã bị khóa."
      : "Ngày này đã qua hạn và không thể cập nhật.",
  };
}

function buildCompletionRecords(completedTasks, meals, workouts) {
  const uniqueTaskIds = [...new Set((completedTasks || []).map(String))];
  const mealIds = new Set(meals.map((meal) => String(meal.id)));
  const workoutIds = new Set(workouts.map((workout) => String(workout.id)));

  return uniqueTaskIds.map((taskId) => {
    if (taskId === "sleep" || taskId === "water") {
      return {
        taskType: taskId,
        taskRefId: taskId,
      };
    }

    const match = /^(meal|workout)-(\d+)$/.exec(taskId);

    if (!match) {
      throw new Error(`Invalid task id: ${taskId}`);
    }

    const [, taskType, taskRefId] = match;
    const isKnownTask =
      (taskType === "meal" && mealIds.has(taskRefId)) ||
      (taskType === "workout" && workoutIds.has(taskRefId));

    if (!isKnownTask) {
      throw new Error(`Task does not belong to this day: ${taskId}`);
    }

    return {
      taskType,
      taskRefId,
    };
  });
}

async function syncFoodExpenseForCompletedDay(
  executor,
  userId,
  plan,
  day,
  meals,
  isCompleted
) {
  const description = `Auto food expense for plan ${plan.id} day ${day.day_number}`;

  if (!isCompleted) {
    await executor.query(
      `DELETE FROM expense_logs
       WHERE user_id = ? AND category = 'Food' AND description = ?`,
      [userId, description]
    );
    return;
  }

  const foodAmount = meals.reduce(
    (sum, meal) => sum + Number(meal.cost || 0),
    0
  );

  if (foodAmount <= 0) {
    return;
  }

  const [existingLogs] = await executor.query(
    `SELECT id FROM expense_logs
     WHERE user_id = ? AND category = 'Food' AND description = ?
     LIMIT 1`,
    [userId, description]
  );

  if (existingLogs.length > 0) {
    await executor.query(
      `UPDATE expense_logs
       SET log_date = CURDATE(), amount = ?
       WHERE id = ? AND user_id = ?`,
      [foodAmount, existingLogs[0].id, userId]
    );
    return;
  }

  await executor.query(
    `INSERT INTO expense_logs
     (user_id, log_date, category, amount, description)
     VALUES (?, CURDATE(), 'Food', ?, ?)`,
    [userId, foodAmount, description]
  );
}

async function recalculatePlanDayPlannedCost(executor, planDayId) {
  const [[row]] = await executor.query(
    `SELECT COALESCE(SUM(COALESCE(ml.estimated_cost, m.cost)), 0) AS plannedCost
     FROM meals m
     LEFT JOIN meal_library ml ON ml.id = m.meal_library_id
     WHERE m.plan_day_id = ?`,
    [planDayId]
  );
  const plannedCost = Number(row?.plannedCost || 0);

  await executor.query(
    "UPDATE plan_days SET planned_cost = ? WHERE id = ?",
    [plannedCost, planDayId]
  );

  return plannedCost;
}

async function awardBadge(executor, userId, badgeName) {
  const [result] = await executor.query(
    `INSERT IGNORE INTO user_badges (user_id, badge_name)
     VALUES (?, ?)`,
    [userId, badgeName]
  );

  return result.affectedRows > 0 ? badgeName : null;
}

async function checkAndAwardBadges(executor, userId) {
  const awardedBadges = [];

  const [completedRows] = await executor.query(
    `SELECT pd.completed
     FROM plans p
     JOIN plan_days pd ON pd.plan_id = p.id
     WHERE p.user_id = ? AND p.status = 'active'
       AND pd.plan_date <= CURDATE()
     ORDER BY pd.plan_date DESC, pd.day_number DESC
     LIMIT 3`,
    [userId]
  );

  if (
    completedRows.length >= 3 &&
    completedRows.every((row) => Boolean(row.completed))
  ) {
    const badge = await awardBadge(executor, userId, "3-Day Streak");
    if (badge) awardedBadges.push(badge);
  }

  const [budgetRows] = await executor.query(
    `SELECT pd.actual_cost, pd.planned_cost
     FROM plans p
     JOIN plan_days pd ON pd.plan_id = p.id
     WHERE p.user_id = ?
       AND p.status = 'active'
       AND pd.completed = true
       AND pd.actual_cost IS NOT NULL
     ORDER BY pd.plan_date DESC, pd.day_number DESC
     LIMIT 3`,
    [userId]
  );

  if (
    budgetRows.length >= 3 &&
    budgetRows.every((row) => Number(row.actual_cost) < Number(row.planned_cost))
  ) {
    const badge = await awardBadge(executor, userId, "Budget Master");
    if (badge) awardedBadges.push(badge);
  }

  return awardedBadges;
}

async function insertPlanDayDetails(executor, planDayId, day) {
  for (const meal of day.meals) {
    await executor.query(
      `INSERT INTO meals (plan_day_id, meal_library_id, meal_name, meal_time, calories, cost)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        planDayId,
        meal.mealLibraryId || null,
        meal.mealName,
        meal.mealTime,
        meal.calories,
        meal.cost,
      ]
    );
  }

  for (const workout of day.workouts) {
    await executor.query(
      `INSERT INTO workouts
       (plan_day_id, workout_library_id, workout_name, duration_minutes, description)
       VALUES (?, ?, ?, ?, ?)`,
      [
        planDayId,
        workout.workoutLibraryId || null,
        workout.workoutName,
        workout.durationMinutes,
        workout.description,
      ]
    );
  }
}

async function createPlanForUser(userId) {
  const [profiles] = await pool.query(
    "SELECT * FROM user_profiles WHERE user_id = ?",
    [userId]
  );

  if (profiles.length === 0) {
    throw new Error("Profile not found. Complete onboarding first.");
  }

  const profile = profiles[0];
  const startDate = new Date();
  const durationDays = profile.duration_days || 30;

  const budget = generateBudgetBreakdown(
    Number(profile.budget_total),
    profile.budget_style,
    profile.workout_location
  );
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE plans
       SET status = 'completed'
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const [planResult] = await connection.query(
      `INSERT INTO plans (user_id, duration_days, start_date, status)
       VALUES (?, ?, ?, 'active')`,
      [userId, durationDays, toLocalDateKey(startDate)]
    );

    const planId = planResult.insertId;

    await connection.query(
      `INSERT INTO budget_breakdowns
       (plan_id, food_amount, workout_amount, wellness_amount, buffer_amount, total_budget, daily_budget)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        planId,
        budget.food,
        budget.workout,
        budget.wellness,
        budget.buffer,
        budget.totalBudget,
        budget.dailyBudget,
      ]
    );

    const planDays = await generatePlanDays(connection, startDate, profile, budget);

    for (const day of planDays) {
      const [dayResult] = await connection.query(
        `INSERT INTO plan_days
         (plan_id, day_number, plan_date, workout_type, planned_calories, planned_cost, completed)
         VALUES (?, ?, ?, ?, ?, ?, false)`,
        [
          planId,
          day.dayNumber,
          day.planDate,
          day.workoutType,
          day.plannedCalories,
          day.plannedCost,
        ]
      );

      const planDayId = dayResult.insertId;

      await insertPlanDayDetails(connection, planDayId, day);
    }

    await connection.commit();

    return { planId, budget };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function syncActivePlanBudgetForUser(userId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [profiles] = await connection.query(
      "SELECT * FROM user_profiles WHERE user_id = ?",
      [userId]
    );

    if (profiles.length === 0) {
      throw new Error("Profile not found. Complete onboarding first.");
    }

    const profile = profiles[0];
    const plan = await getActivePlanForUser(connection, userId);

    if (!plan) {
      await connection.commit();
      return null;
    }

    const budget = generateBudgetBreakdown(
      Number(profile.budget_total),
      profile.budget_style,
      profile.workout_location
    );

    await connection.query(
      `UPDATE budget_breakdowns
       SET food_amount = ?,
           workout_amount = ?,
           wellness_amount = ?,
           buffer_amount = ?,
           total_budget = ?,
           daily_budget = ?
       WHERE plan_id = ?`,
      [
        budget.food,
        budget.workout,
        budget.wellness,
        budget.buffer,
        budget.totalBudget,
        budget.dailyBudget,
        plan.id,
      ]
    );

    const planDays = await generatePlanDays(
      connection,
      new Date(plan.start_date),
      profile,
      budget
    );

    for (const generatedDay of planDays) {
      const day = await getPlanDayRecord(
        connection,
        plan.id,
        generatedDay.dayNumber
      );

      if (!day || day.completed) {
        continue;
      }

      await connection.query(
        `UPDATE plan_days
         SET workout_type = ?, planned_calories = ?, planned_cost = ?
         WHERE id = ?`,
        [
          generatedDay.workoutType,
          generatedDay.plannedCalories,
          generatedDay.plannedCost,
          day.id,
        ]
      );
      await connection.query(
        "DELETE FROM daily_task_completions WHERE plan_day_id = ?",
        [day.id]
      );
      await connection.query("DELETE FROM meals WHERE plan_day_id = ?", [day.id]);
      await connection.query("DELETE FROM workouts WHERE plan_day_id = ?", [
        day.id,
      ]);
      await insertPlanDayDetails(connection, day.id, generatedDay);
    }

    await connection.commit();
    return budget;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getCurrentPlan(userId) {
  const plan = await getActivePlanForUser(pool, userId);

  if (!plan) return null;

  const [days] = await pool.query(
    `SELECT
       pd.*,
       COALESCE(
         (
           SELECT SUM(COALESCE(ml.estimated_cost, m.cost))
           FROM meals m
           LEFT JOIN meal_library ml ON ml.id = m.meal_library_id
           WHERE m.plan_day_id = pd.id
         ),
         pd.planned_cost
       ) AS planned_cost
     FROM plan_days pd
     WHERE pd.plan_id = ?
     ORDER BY pd.day_number ASC`,
    [plan.id]
  );
  const [budgets] = await pool.query(
    "SELECT * FROM budget_breakdowns WHERE plan_id = ? LIMIT 1",
    [plan.id]
  );

  return {
    ...plan,
    budget: budgets[0] || null,
    days: days.map((day) => {
      const lockState = getDayLockState(day);

      return {
        ...day,
        is_locked: lockState.isLocked,
        lock_reason: lockState.lockReason,
      };
    }),
  };
}

async function getPlanDay(userId, dayNumber) {
  const plan = await getActivePlanForUser(pool, userId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  const day = await getPlanDayRecord(pool, plan.id, dayNumber);

  if (!day) {
    throw new Error("Plan day not found");
  }
  const { meals, workouts, completedTasks } = await getPlanDayDetails(pool, day.id);
  const lockState = getDayLockState(day);

  return {
    ...day,
    is_locked: lockState.isLocked,
    lock_reason: lockState.lockReason,
    meals,
    workouts,
    completed_tasks: completedTasks,
    sleep: { target: "8 giờ", time: "22:00 - 06:00" },
    water: { target: "2.5 lít", glasses: 10 },
  };
}

async function updatePlanDayCompletion(userId, dayNumber, completedTasks) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const plan = await getActivePlanForUser(connection, userId);

    if (!plan) {
      throw new Error("Plan not found");
    }

    const day = await getPlanDayRecord(connection, plan.id, dayNumber);

    if (!day) {
      throw new Error("Plan day not found");
    }

    const lockState = getDayLockState(day);

    if (lockState.isLocked) {
      throw new Error(lockState.lockReason);
    }

    const { meals, workouts } = await getPlanDayDetails(connection, day.id);
    const completionRecords = buildCompletionRecords(
      completedTasks,
      meals,
      workouts
    );

    await connection.query(
      `DELETE FROM daily_task_completions WHERE plan_day_id = ?`,
      [day.id]
    );

    for (const record of completionRecords) {
      await connection.query(
        `INSERT INTO daily_task_completions
         (plan_day_id, task_type, task_ref_id, is_completed)
         VALUES (?, ?, ?, true)`,
        [day.id, record.taskType, record.taskRefId]
      );
    }

    const expectedTasks = meals.length + workouts.length + 2;
    const isCompleted =
      expectedTasks > 0 && completionRecords.length === expectedTasks;

    await connection.query(
      `UPDATE plan_days
       SET completed = ?
       WHERE id = ?`,
      [isCompleted, day.id]
    );

    await syncFoodExpenseForCompletedDay(
      connection,
      userId,
      plan,
      day,
      meals,
      isCompleted
    );

    const awardedBadges = isCompleted
      ? await checkAndAwardBadges(connection, userId)
      : [];

    await connection.commit();

    return {
      dayNumber,
      completed: isCompleted,
      awardedBadges,
      completed_tasks: completionRecords.map((record) =>
        record.taskType === "sleep" || record.taskType === "water"
          ? record.taskType
          : `${record.taskType}-${record.taskRefId}`
      ),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function swapMeal(userId, dayNumber, mealId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const profile = await getProfileForUser(connection, userId);
    const { day } = await getActivePlanDayForUser(connection, userId, dayNumber);
    const lockState = getDayLockState(day);

    if (lockState.isLocked) {
      throw new Error(lockState.lockReason);
    }

    const [[currentMeal]] = await connection.query(
      `SELECT m.*
       FROM meals m
       WHERE m.id = ? AND m.plan_day_id = ?
       LIMIT 1`,
      [mealId, day.id]
    );

    if (!currentMeal) {
      throw new Error("Meal not found");
    }

    const mealType = getMealTypeFromMealTime(currentMeal.meal_time);
    const budgetTier = calculateBudgetTier(profile.budget_total);
    const goalType = ["lose", "maintain", "gain"].includes(profile.goal_type)
      ? profile.goal_type
      : "maintain";
    const [libraryRows] = await connection.query(
      `SELECT id, meal_name, calories, estimated_cost
       FROM meal_library
       WHERE is_active = true
         AND goal_type = ?
         AND budget_tier = ?
         AND meal_type = ?
         AND id <> COALESCE(?, 0)
       ORDER BY RAND()
       LIMIT 1`,
      [goalType, budgetTier, mealType, currentMeal.meal_library_id]
    );

    if (libraryRows.length === 0) {
      throw new Error("No replacement meal found");
    }

    const replacement = libraryRows[0];
    await connection.query(
      `UPDATE meals
       SET meal_library_id = ?, meal_name = ?, calories = ?, cost = ?
       WHERE id = ?`,
      [
        replacement.id,
        replacement.meal_name,
        replacement.calories,
        replacement.estimated_cost,
        currentMeal.id,
      ]
    );
    const plannedCost = await recalculatePlanDayPlannedCost(connection, day.id);

    await connection.commit();

    return {
      meal: {
        id: currentMeal.id,
        plan_day_id: day.id,
        meal_library_id: replacement.id,
        meal_name: localizeMealName(replacement.meal_name),
        meal_time: currentMeal.meal_time,
        calories: Number(replacement.calories),
        cost: Number(replacement.estimated_cost),
      },
      planned_cost: plannedCost,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function swapWorkout(userId, dayNumber, workoutId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const profile = await getProfileForUser(connection, userId);
    const { day } = await getActivePlanDayForUser(connection, userId, dayNumber);
    const lockState = getDayLockState(day);

    if (lockState.isLocked) {
      throw new Error(lockState.lockReason);
    }

    const [[currentWorkout]] = await connection.query(
      `SELECT w.*, wl.workout_type AS library_workout_type
       FROM workouts w
       LEFT JOIN workout_library wl ON wl.id = w.workout_library_id
       WHERE w.id = ? AND w.plan_day_id = ?
       LIMIT 1`,
      [workoutId, day.id]
    );

    if (!currentWorkout) {
      throw new Error("Workout not found");
    }

    const workoutType = normalizeWorkoutType(
      currentWorkout.library_workout_type || day.workout_type
    );
    const gender = profile.gender === "female" ? "female" : "male";
    const location = profile.workout_location === "gym" ? "gym" : "home";
    const [libraryRows] = await connection.query(
      `SELECT id, workout_type, workout_name, suggested_volume, notes
       FROM workout_library
       WHERE is_active = true
         AND workout_type = ?
         AND location = ?
         AND (gender_target = ? OR gender_target = 'both')
         AND id <> COALESCE(?, 0)
       ORDER BY RAND()
       LIMIT 1`,
      [workoutType, location, gender, currentWorkout.workout_library_id]
    );

    if (libraryRows.length === 0) {
      throw new Error("No replacement workout found");
    }

    const replacement = libraryRows[0];
    const durationMinutes = calculateWorkoutDurationMinutes(
      replacement.workout_type,
      replacement.suggested_volume
    );

    await connection.query(
      `UPDATE workouts
       SET workout_library_id = ?,
           workout_name = ?,
           duration_minutes = ?,
           description = ?
       WHERE id = ?`,
      [
        replacement.id,
        replacement.workout_name,
        durationMinutes,
        replacement.suggested_volume || replacement.notes || replacement.workout_type,
        currentWorkout.id,
      ]
    );

    await connection.commit();

    return {
      workout: {
        id: currentWorkout.id,
        plan_day_id: day.id,
        workout_library_id: replacement.id,
        workout_name: localizeWorkoutName(replacement.workout_name),
        duration_minutes: durationMinutes,
        description: localizeWorkoutDescription(
          replacement.suggested_volume || replacement.notes || replacement.workout_type
        ),
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateActualCost(userId, dayNumber, actualCost) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { day } = await getActivePlanDayForUser(connection, userId, dayNumber);
    await connection.query(
      "UPDATE plan_days SET actual_cost = ? WHERE id = ?",
      [actualCost, day.id]
    );
    const awardedBadges = await checkAndAwardBadges(connection, userId);

    await connection.commit();

    return {
      dayNumber,
      actual_cost: Number(actualCost),
      planned_cost: Number(day.planned_cost || 0),
      awardedBadges,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createPlanForUser,
  getCurrentPlan,
  getPlanDay,
  updatePlanDayCompletion,
  syncActivePlanBudgetForUser,
  swapMeal,
  swapWorkout,
  updateActualCost,
};
