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
    const data = await trackingService.getWeightLogs(req.user.id, req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateWeightLog(req, res) {
  try {
    const data = await trackingService.updateWeightLog(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

async function deleteWeightLog(req, res) {
  try {
    const data = await trackingService.deleteWeightLog(req.user.id, req.params.id);
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
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
    const data = await trackingService.getExpenseLogs(req.user.id, req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateExpenseLog(req, res) {
  try {
    const data = await trackingService.updateExpenseLog(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

async function deleteExpenseLog(req, res) {
  try {
    const data = await trackingService.deleteExpenseLog(
      req.user.id,
      req.params.id
    );
    res.json(data);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

module.exports = {
  addWeightLog,
  getWeightLogs,
  updateWeightLog,
  deleteWeightLog,
  addExpenseLog,
  getExpenseLogs,
  updateExpenseLog,
  deleteExpenseLog,
};
