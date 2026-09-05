const express = require("express");

const contractController = require("../controllers/contract.controller");

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
  asyncHandler(contractController.createContract)
);

router.get(
  "/",
  protect,
  authorize(...hrRoles),
  asyncHandler(contractController.getContracts)
);

router.get(
  "/:id",
  protect,
  authorize(...hrRoles),
  asyncHandler(contractController.getContractById)
);

router.patch(
  "/:id",
  protect,
  authorize(...hrRoles),
  asyncHandler(contractController.updateContract)
);

router.patch(
  "/:id/activate",
  protect,
  authorize(...hrRoles),
  asyncHandler(contractController.activateContract)
);

router.patch(
  "/:id/terminate",
  protect,
  authorize(...hrRoles),
  asyncHandler(contractController.terminateContract)
);

module.exports = router;