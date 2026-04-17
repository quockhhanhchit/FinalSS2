const planService = require("../services/plan.service");

async function createPlan(req, res) {
  try {
    const data = await planService.createPlanForUser(req.user.id);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getPlan(req, res) {
  try {
    const data = await planService.getCurrentPlan(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getPlanDay(req, res) {
  try {
    const dayNumber = Number(req.params.dayNumber);

    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      return res.status(400).json({ message: "Invalid day number" });
    }

    const data = await planService.getPlanDay(req.user.id, dayNumber);
    res.json(data);
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
}

async function completePlanDay(req, res) {
  try {
    const dayNumber = Number(req.params.dayNumber);

    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      return res.status(400).json({ message: "Invalid day number" });
    }

    const data = await planService.updatePlanDayCompletion(
      req.user.id,
      dayNumber,
      req.body.completedTasks
    );
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function swapMeal(req, res) {
  try {
    const dayNumber = Number(req.params.dayNumber);
    const mealId = Number(req.params.mealId);

    if (!Number.isInteger(dayNumber) || dayNumber < 1 || !Number.isInteger(mealId)) {
      return res.status(400).json({ message: "Invalid swap request" });
    }

    const data = await planService.swapMeal(req.user.id, dayNumber, mealId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function swapWorkout(req, res) {
  try {
    const dayNumber = Number(req.params.dayNumber);
    const workoutId = Number(req.params.workoutId);

    if (!Number.isInteger(dayNumber) || dayNumber < 1 || !Number.isInteger(workoutId)) {
      return res.status(400).json({ message: "Invalid swap request" });
    }

    const data = await planService.swapWorkout(req.user.id, dayNumber, workoutId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateActualCost(req, res) {
  try {
    const dayNumber = Number(req.params.dayNumber);

    if (!Number.isInteger(dayNumber) || dayNumber < 1) {
      return res.status(400).json({ message: "Invalid day number" });
    }

    const data = await planService.updateActualCost(
      req.user.id,
      dayNumber,
      req.body.actual_cost
    );
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function continuePlan(req, res) {
  try {
    const data = await planService.continueCurrentPlan(req.user.id, {
      startFromToday: Boolean(req.body?.startFromToday),
    });
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function declineContinuation(req, res) {
  try {
    const data = await planService.declineCurrentPlanContinuation(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createPlan,
  getPlan,
  getPlanDay,
  completePlanDay,
  continuePlan,
  declineContinuation,
  swapMeal,
  swapWorkout,
  updateActualCost,
};
