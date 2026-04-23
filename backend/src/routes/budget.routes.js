const express = require("express");
const { z } = require("zod");
const budgetController = require("../controllers/budget.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validator.middleware");

const router = express.Router();

const updateBudgetSchema = z.object({
  total_budget: z.coerce
    .number()
    .positive("Budget must be greater than 0")
    .min(3000000, "Minimum budget is 3,000,000 VND"),
});

router.get("/current", authMiddleware, budgetController.getBudget);
router.patch(
  "/current",
  authMiddleware,
  validateBody(updateBudgetSchema),
  budgetController.updateBudget
);

module.exports = router;
