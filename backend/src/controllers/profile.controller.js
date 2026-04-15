const profileService = require("../services/profile.service");

async function saveProfile(req, res) {
  try {
    if (req.body.budget_total && Number(req.body.budget_total) < 3000000) {
      throw new Error("Minimum budget is 3,000,000 VND.");
    }
    const data = await profileService.saveProfile(req.user.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const data = await profileService.getProfile(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateBodyGoals(req, res) {
  try {
    const data = await profileService.updateBodyGoals(req.user.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function updateBudgetPreferences(req, res) {
  try {
    if (req.body.budget && Number(req.body.budget) < 3000000) {
      throw new Error("Minimum budget is 3,000,000 VND.");
    }
    const data = await profileService.updateBudgetPreferences(
      req.user.id,
      req.body
    );
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getNotificationSettings(req, res) {
  try {
    const data = await profileService.getNotificationSettings(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateNotificationSettings(req, res) {
  try {
    const data = await profileService.updateNotificationSettings(
      req.user.id,
      req.body
    );
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  saveProfile,
  getProfile,
  updateBodyGoals,
  updateBudgetPreferences,
  getNotificationSettings,
  updateNotificationSettings,
};
