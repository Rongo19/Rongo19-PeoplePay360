const express = require("express");

const employeeController = require("../controllers/employee.controller");

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
  asyncHandler(employeeController.createEmployee)
);

router.get(
  "/",
  protect,
  authorize(...hrRoles),
  asyncHandler(employeeController.getEmployees)
);

router.get(
  "/:id",
  protect,
  asyncHandler(employeeController.getEmployeeById)
);

router.patch(
  "/:id",
  protect,
  authorize(...hrRoles),
  asyncHandler(employeeController.updateEmployee)
);

router.patch(
  "/:id/deactivate",
  protect,
  authorize(...hrRoles),
  asyncHandler(employeeController.deactivateEmployee)
);

module.exports = router;