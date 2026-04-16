const dashboardService = require("../services/dashboard.service");

async function getDashboard(req, res) {
  try {
    const data = await dashboardService.getDashboardSummary(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAnalytics(req, res) {
  try {
    const data = await dashboardService.getDashboardAnalytics(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getDashboard,
  getAnalytics,
};
