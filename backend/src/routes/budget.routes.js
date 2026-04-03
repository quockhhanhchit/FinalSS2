const express = require("express");
const budgetController = require("../controllers/budget.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/current", authMiddleware, budgetController.getBudget);

module.exports = router;