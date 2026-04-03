const authService = require("../services/auth.service");

async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;
    const data = await authService.register({ fullName, email, password });
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function me(req, res) {
  try {
    const data = await authService.getMe(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  register,
  login,
  me,
};