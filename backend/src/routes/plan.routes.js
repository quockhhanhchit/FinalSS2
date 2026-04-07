const express = require("express");
const { z } = require("zod");
const planController = require("../controllers/plan.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validator.middleware");

const router = express.Router();
const completeDaySchema = z.object({
  completedTasks: z.array(z.string().min(1)).default([]),
});

router.post("/generate", authMiddleware, planController.createPlan);
router.get("/current", authMiddleware, planController.getPlan);
router.get("/current/day/:dayNumber", authMiddleware, planController.getPlanDay);
router.put(
  "/current/day/:dayNumber/complete",
  authMiddleware,
  validateBody(completeDaySchema),
  planController.completePlanDay
);

module.exports = router;
