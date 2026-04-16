const express = require("express");
const { z } = require("zod");
const planController = require("../controllers/plan.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validator.middleware");

const router = express.Router();
const completeDaySchema = z.object({
  completedTasks: z.array(z.string().min(1)).default([]),
});
const actualCostSchema = z.object({
  actual_cost: z.number().nonnegative(),
});

router.post("/generate", authMiddleware, planController.createPlan);
router.get("/current", authMiddleware, planController.getPlan);
router.post("/current/continue", authMiddleware, planController.continuePlan);
router.post(
  "/current/decline-continuation",
  authMiddleware,
  planController.declineContinuation
);
router.get("/current/day/:dayNumber", authMiddleware, planController.getPlanDay);
router.patch(
  "/day/:dayNumber/swap-meal/:mealId",
  authMiddleware,
  planController.swapMeal
);
router.patch(
  "/day/:dayNumber/swap-workout/:workoutId",
  authMiddleware,
  planController.swapWorkout
);
router.patch(
  "/day/:dayNumber/actual-cost",
  authMiddleware,
  validateBody(actualCostSchema),
  planController.updateActualCost
);
router.put(
  "/current/day/:dayNumber/complete",
  authMiddleware,
  validateBody(completeDaySchema),
  planController.completePlanDay
);

module.exports = router;
