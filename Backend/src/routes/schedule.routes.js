const express = require("express");

const scheduleController = require("../controllers/schedule.controller");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const hrRoles = [
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "ADMIN",
];

router.post(
  "/",
  protect,
  authorize(...hrRoles),
  asyncHandler(scheduleController.createSchedule)
);

router.get(
  "/",
  protect,
  authorize(...hrRoles),
  asyncHandler(scheduleController.getSchedules)
);

router.get(
  "/:id",
  protect,
  authorize(...hrRoles),
  asyncHandler(scheduleController.getScheduleById)
);

router.patch(
  "/:id",
  protect,
  authorize(...hrRoles),
  asyncHandler(scheduleController.updateSchedule)
);

router.patch(
  "/:id/deactivate",
  protect,
  authorize(...hrRoles),
  asyncHandler(scheduleController.deactivateSchedule)
);

module.exports = router;