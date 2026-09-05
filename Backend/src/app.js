const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middlewares/error.middleware");

const authRoutes = require("./routes/auth.routes");
const employeeRoutes = require("./routes/employee.routes");
const contractRoutes = require("./routes/contract.routes");
const scheduleRoutes = require("./routes/schedule.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const timeoffRoutes = require("./routes/timeoff.routes");
const salaryRoutes = require("./routes/salary.routes");
const payrunRoutes = require("./routes/payrun.routes");
const payslipRoutes = require("./routes/payslip.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

// ================================
// Security
// ================================

app.use(helmet());

// ================================
// CORS
// ================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },

    credentials: true,

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],

    methods: [
      "GET",
      "HEAD",
      "PUT",
      "PATCH",
      "POST",
      "DELETE",
      "OPTIONS",
    ],
  })
);
// ================================
// Body Parsing
// ================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// Rate Limiting
// ================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max:
    process.env.NODE_ENV === "production"
      ? 100
      : 1000,

  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ================================
// Health Check
// ================================

// Simple health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PeoplePay360 API is running 🚀",
  });
});

// API health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PeoplePay360 API is running 🚀",
  });
});

// ================================
// API Routes
// ================================

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/employees", employeeRoutes);

app.use("/api/v1/contracts", contractRoutes);

app.use("/api/v1/schedules", scheduleRoutes);

app.use("/api/v1/attendance", attendanceRoutes);

app.use("/api/v1/timeoff", timeoffRoutes);

app.use("/api/v1/salary", salaryRoutes);

app.use("/api/v1/payruns", payrunRoutes);

app.use("/api/v1/payslips", payslipRoutes);

app.use("/api/v1/dashboard", dashboardRoutes);

// ================================
// Error Handler
// MUST BE LAST
// ================================

app.use(errorHandler);

module.exports = app;