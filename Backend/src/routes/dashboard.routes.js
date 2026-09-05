const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const controller = require("../controllers/dashboard.controller");

const DASHBOARD_ROLES = [
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "ADMIN",
];

router.get(
  "/overview",
  protect,
  authorize(...DASHBOARD_ROLES),
  controller.getOverview
);

router.get(
  "/employee-summary",
  protect,
  authorize(...DASHBOARD_ROLES),
  controller.getEmployeeSummary
);

router.get(
  "/payroll-summary",
  protect,
  authorize(...DASHBOARD_ROLES),
  controller.getPayrollSummary
);

router.get(
  "/recent-payslips",
  protect,
  authorize(...DASHBOARD_ROLES),
  controller.getRecentPayslips
);

router.get(
  "/leave-summary",
  protect,
  authorize(...DASHBOARD_ROLES),
  controller.getLeaveSummary
);

module.exports = router;