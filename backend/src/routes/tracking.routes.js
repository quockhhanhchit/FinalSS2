const express = require("express");
const trackingController = require("../controllers/tracking.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/weights", authMiddleware, trackingController.getWeightLogs);
router.post("/weights", authMiddleware, trackingController.addWeightLog);

router.get("/expenses", authMiddleware, trackingController.getExpenseLogs);
router.post("/expenses", authMiddleware, trackingController.addExpenseLog);

module.exports = router;