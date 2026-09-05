const express = require("express");

const attendanceController = require(
  "../controllers/attendance.controller"
);

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
  asyncHandler(attendanceController.createAttendance)
);

router.get(
  "/",
  protect,
  authorize(...hrRoles),
  asyncHandler(attendanceController.getAttendances)
);

router.get(
  "/:id",
  protect,
  authorize(...hrRoles),
  asyncHandler(attendanceController.getAttendanceById)
);

router.patch(
  "/:id",
  protect,
  authorize(...hrRoles),
  asyncHandler(attendanceController.updateAttendance)
);

module.exports = router;