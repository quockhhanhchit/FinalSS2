const trackingService = require("../services/tracking.service");

async function addWeightLog(req, res) {
  try {
    const data = await trackingService.addWeightLog(req.user.id, req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getWeightLogs(req, res) {
  try {
    const data = await trackingService.getWeightLogs(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function addExpenseLog(req, res) {
  try {
    const data = await trackingService.addExpenseLog(req.user.id, req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getExpenseLogs(req, res) {
  try {
    const data = await trackingService.getExpenseLogs(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addWeightLog,
  getWeightLogs,
  addExpenseLog,
  getExpenseLogs,
};