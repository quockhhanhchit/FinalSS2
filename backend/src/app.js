const express = require("express");
const cors = require("cors");
const { swaggerSpec, swaggerUi } = require("./config/swagger");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const planRoutes = require("./routes/plan.routes");
const trackingRoutes = require("./routes/tracking.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const budgetRoutes = require("./routes/budget.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "BudgetFit backend is running" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budget", budgetRoutes);

module.exports = app;
