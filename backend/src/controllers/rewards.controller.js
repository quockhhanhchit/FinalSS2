const rewardsService = require("../services/rewards.service");

async function getSummary(req, res) {
  try {
    const data = await rewardsService.getRewardsSummary(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function redeem(req, res) {
  try {
    const data = await rewardsService.redeemVoucher(req.user.id, req.body.voucherId);
    res.json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
}

module.exports = {
  getSummary,
  redeem,
};
