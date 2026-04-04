const authService = require("../services/auth.service");

async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;
    const data = await authService.register({ fullName, email, password });
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    res.json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
}

async function googleLogin(req, res) {
  try {
    const data = await authService.loginWithGoogle({
      idToken: req.body.idToken,
    });
    res.json(data);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
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

async function refreshToken(req, res) {
  try {
    const data = await authService.refreshAccessToken(req.body.refreshToken);
    res.json(data);
  } catch (error) {
    res.status(error.status || 401).json({ message: error.message });
  }
}

async function logout(req, res) {
  try {
    const data = await authService.logout(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  me,
  refreshToken,
  logout,
};
