const profileService = require("../services/profile.service");

async function saveProfile(req, res) {
  try {
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

module.exports = {
  saveProfile,
  getProfile,
};