const cron = require("node-cron");
const aiService = require("../services/ai.service");

let cronStarted = false;

function startAiWeeklySummaryCron() {
  if (cronStarted) {
    return;
  }

  cron.schedule(
    "0 8 * * 0",
    async () => {
      await aiService.runWeeklySummaryForAllActiveUsers();
    },
    {
      timezone: process.env.APP_TIMEZONE || "Asia/Bangkok",
    }
  );

  cronStarted = true;
}

module.exports = {
  startAiWeeklySummaryCron,
};
