const express = require("express");
const { z } = require("zod");
const rewardsController = require("../controllers/rewards.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validator.middleware");

const router = express.Router();

const redeemSchema = z.object({
  voucherId: z.coerce.number().int().positive("Voucher id is required"),
});

router.get("/summary", authMiddleware, rewardsController.getSummary);
router.post(
  "/redeem",
  authMiddleware,
  validateBody(redeemSchema),
  rewardsController.redeem
);

module.exports = router;
