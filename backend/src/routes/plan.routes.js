const express = require("express");
const planController = require("../controllers/plan.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/generate", authMiddleware, planController.createPlan);
router.get("/current", authMiddleware, planController.getPlan);
router.get("/current/day/:dayNumber", authMiddleware, planController.getPlanDay);

module.exports = router;