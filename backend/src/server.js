require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");
const { startAiWeeklySummaryCron } = require("./cron/ai-weekly-summary.cron");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    startAiWeeklySummaryCron();
  } catch (error) {
    console.error("Failed to connect database:", error.message);
    process.exit(1);
  }
}

startServer();
