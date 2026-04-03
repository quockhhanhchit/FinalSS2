const planService = require("../services/plan.service");

async function createPlan(req, res) {
  try {
    const data = await planService.createPlanForUser(req.user.id);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getPlan(req, res) {
  try {
    const data = await planService.getCurrentPlan(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getPlanDay(req, res) {
  try {
    const dayNumber = Number(req.params.dayNumber);
    const data = await planService.getPlanDay(req.user.id, dayNumber);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

module.exports = {
  createPlan,
  getPlan,
  getPlanDay,
};