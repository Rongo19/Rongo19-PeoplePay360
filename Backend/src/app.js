const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/error.middleware");
const employeeRoutes = require("./routes/employee.routes");
const contractRoutes = require("./routes/contract.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const timeoffRoutes = require("./routes/timeoff.routes");
const salaryRoutes = require("./routes/salary.routes");
const payrunRoutes = require("./routes/payrun.routes");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PeoplePay360 API is running 🚀",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/contracts", contractRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use(
  "/api/v1/attendance",
  attendanceRoutes
);
app.use("/api/v1/timeoff", timeoffRoutes);
app.use("/api/v1/salary", salaryRoutes);
app.use("/api/v1/payruns", payrunRoutes);

app.use(errorHandler);

module.exports = app;