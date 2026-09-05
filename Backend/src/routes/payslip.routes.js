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

router.get(
  "/",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.getPayslips
);

router.get(
  "/:id/pdf",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.downloadPayslipPDF
);

router.post(
  "/:id/send-email",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.sendPayslipEmail
);

router.get(
  "/:id",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.getPayslipById
);

module.exports = router;