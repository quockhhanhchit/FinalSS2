const express = require("express");
const trackingController = require("../controllers/tracking.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/weights", authMiddleware, trackingController.getWeightLogs);
router.post("/weights", authMiddleware, trackingController.addWeightLog);
router.put("/weights/:id", authMiddleware, trackingController.updateWeightLog);
router.delete("/weights/:id", authMiddleware, trackingController.deleteWeightLog);

router.get("/expenses", authMiddleware, trackingController.getExpenseLogs);
router.post("/expenses", authMiddleware, trackingController.addExpenseLog);
router.put("/expenses/:id", authMiddleware, trackingController.updateExpenseLog);
router.delete(
  "/expenses/:id",
  authMiddleware,
  trackingController.deleteExpenseLog
);

module.exports = router;
