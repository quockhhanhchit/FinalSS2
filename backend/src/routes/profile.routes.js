const express = require("express");
const { z } = require("zod");
const profileController = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validator.middleware");

const router = express.Router();

const bodyGoalsSchema = z.object({
  age: z.coerce.number().int().positive(),
  height: z.coerce.number().positive(),
  weight: z.coerce.number().positive(),
  goal: z.enum(["lose", "maintain", "gain"]),
  duration: z.coerce.number().int().positive(),
});

const budgetSchema = z.object({
  budget: z.coerce.number().positive(),
  location: z.enum(["home", "gym"]),
  mealsPerDay: z.coerce.number().int().min(2).max(6),
  budgetStyle: z.enum(["saving", "normal"]),
});

const notificationSchema = z.object({
  dailyReminders: z.boolean(),
  weightTrackingReminders: z.boolean(),
  budgetAlerts: z.boolean(),
});

router.get("/", authMiddleware, profileController.getProfile);
router.post("/", authMiddleware, profileController.saveProfile);
router.put(
  "/body-goals",
  authMiddleware,
  validateBody(bodyGoalsSchema),
  profileController.updateBodyGoals
);
router.put(
  "/budget",
  authMiddleware,
  validateBody(budgetSchema),
  profileController.updateBudgetPreferences
);
router.get(
  "/notifications",
  authMiddleware,
  profileController.getNotificationSettings
);
router.put(
  "/notifications",
  authMiddleware,
  validateBody(notificationSchema),
  profileController.updateNotificationSettings
);

module.exports = router;
