const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/summary", authMiddleware, dashboardController.getDashboard);
router.get("/analytics", authMiddleware, dashboardController.getAnalytics);

module.exports = router;
