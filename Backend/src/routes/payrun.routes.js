const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const controller = require("../controllers/payrun.controller");

const PAYROLL_ROLES = [
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "ADMIN",
];

// ======================================================
// PAYROLL PREVIEW
// ======================================================

router.post(
  "/preview",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.previewPayrun
);

// ======================================================
// PAYRUN
// ======================================================

router.post(
  "/",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.createPayrun
);

router.get(
  "/",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.getPayruns
);

router.get(
  "/:id",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.getPayrunById
);

router.post(
  "/:id/compute",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.computePayrun
);

router.post(
  "/:id/validate",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.validatePayrun
);

router.post(
  "/:id/mark-paid",
  protect,
  authorize(...PAYROLL_ROLES),
  controller.markPayrunPaid
);

module.exports = router;