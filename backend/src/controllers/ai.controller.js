const aiService = require("../services/ai.service");

async function chat(req, res) {
  try {
    const data = await aiService.chatWithAssistant(
      req.user.id,
      req.body.message,
      req.body.language
    );
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function getWeeklySummary(req, res) {
  try {
    const summary = await aiService.getLatestWeeklySummary(req.user.id);
    res.json(summary);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function generateWeeklySummary(req, res) {
  try {
    const summary = await aiService.generateWeeklySummary(
      req.user.id,
      req.body.language,
      { force: true }
    );
    res.json(summary);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function getHistory(req, res) {
  try {
    const history = await aiService.getRecentChatHistory(req.user.id, 10);
    res.json(history);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function getRequestsRemaining(req, res) {
  try {
    const remaining = await aiService.getRemainingRequestsToday(req.user.id);
    res.json({ remaining, max: aiService.MAX_DAILY_CHAT_REQUESTS });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function clearHistory(req, res) {
  try {
    await aiService.clearChatHistory(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

module.exports = {
  chat,
  getHistory,
  getWeeklySummary,
  generateWeeklySummary,
  getRequestsRemaining,
  clearHistory,
};
