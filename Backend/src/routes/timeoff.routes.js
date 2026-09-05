const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const controller = require("../controllers/timeoff.controller");

const HR_ROLES = [
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "ADMIN",
];

// ======================================================
// TIME OFF TYPES
// ======================================================

router.post(
  "/types",
  protect,
  authorize(...HR_ROLES),
  controller.createTimeOffType
);

router.get(
  "/types",
  protect,
  controller.getTimeOffTypes
);

router.patch(
  "/types/:id",
  protect,
  authorize(...HR_ROLES),
  controller.updateTimeOffType
);

// ======================================================
// ALLOCATIONS
// ======================================================

router.post(
  "/allocations",
  protect,
  authorize(...HR_ROLES),
  controller.createAllocation
);

router.get(
  "/allocations",
  protect,
  authorize(...HR_ROLES),
  controller.getAllocations
);

router.get(
  "/balance/:employeeId",
  protect,
  controller.getEmployeeBalance
);

// ======================================================
// REQUESTS
// ======================================================

router.post(
  "/requests",
  protect,
  controller.createRequest
);

router.get(
  "/requests",
  protect,
  controller.getRequests
);

router.get(
  "/requests/:id",
  protect,
  controller.getRequestById
);

router.patch(
  "/requests/:id/approve",
  protect,
  authorize(...HR_ROLES),
  controller.approveRequest
);

router.patch(
  "/requests/:id/reject",
  protect,
  authorize(...HR_ROLES),
  controller.rejectRequest
);

router.patch(
  "/requests/:id/cancel",
  protect,
  controller.cancelRequest
);

module.exports = router;