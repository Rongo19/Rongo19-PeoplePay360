const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const controller = require("../controllers/payslip.controller");

const PAYROLL_ROLES = [
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "ADMIN",
];

// Get all payslips
router.get(
  "/",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.getPayslips
);

// Get single payslip
router.get(
  "/:id",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.getPayslipById
);

// Download payslip PDF
router.get(
  "/:id/pdf",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.downloadPayslipPDF
);

module.exports = router;