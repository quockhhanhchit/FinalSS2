const express = require("express");
const { z } = require("zod");
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validator.middleware");

const router = express.Router();

const chatSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  language: z.enum(["vi", "en"]).optional().default("vi"),
});

const summarySchema = z.object({
  language: z.enum(["vi", "en"]).optional().default("vi"),
});

router.post(
  "/chat",
  authMiddleware,
  validateBody(chatSchema),
  aiController.chat
);
router.get("/history", authMiddleware, aiController.getHistory);
router.get("/weekly-summary", authMiddleware, aiController.getWeeklySummary);
router.post(
  "/weekly-summary",
  authMiddleware,
  validateBody(summarySchema),
  aiController.generateWeeklySummary
);

module.exports = router;
