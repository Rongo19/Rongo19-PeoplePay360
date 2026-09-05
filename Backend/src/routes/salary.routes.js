const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const controller = require("../controllers/salary.controller");

const HR_ROLES = [
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "ADMIN",
];

// ======================================================
// SALARY STRUCTURES
// ======================================================

router.post(
  "/structures",
  protect,
  authorize(...HR_ROLES),
  controller.createSalaryStructure
);

router.get(
  "/structures",
  protect,
  authorize(...HR_ROLES),
  controller.getSalaryStructures
);

router.get(
  "/structures/:id",
  protect,
  authorize(...HR_ROLES),
  controller.getSalaryStructureById
);

router.patch(
  "/structures/:id",
  protect,
  authorize(...HR_ROLES),
  controller.updateSalaryStructure
);

// ======================================================
// SALARY RULES
// ======================================================

router.post(
  "/rules",
  protect,
  authorize(...HR_ROLES),
  controller.createSalaryRule
);

router.get(
  "/rules",
  protect,
  authorize(...HR_ROLES),
  controller.getSalaryRules
);

router.get(
  "/rules/:id",
  protect,
  authorize(...HR_ROLES),
  controller.getSalaryRuleById
);

router.patch(
  "/rules/:id",
  protect,
  authorize(...HR_ROLES),
  controller.updateSalaryRule
);

router.patch(
  "/rules/:id/deactivate",
  protect,
  authorize(...HR_ROLES),
  controller.deactivateSalaryRule
);

module.exports = router;