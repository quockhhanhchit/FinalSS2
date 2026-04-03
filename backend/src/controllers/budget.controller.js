const budgetService = require("../services/budget.service");

async function getBudget(req, res) {
  try {
    const data = await budgetService.getCurrentBudget(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getBudget,
};