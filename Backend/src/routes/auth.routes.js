const express = require("express");

const authController = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/register",
  asyncHandler(authController.register)
);

router.post(
  "/login",
  asyncHandler(authController.login)
);

router.get(
  "/me",
  protect,
  asyncHandler(authController.me)
);

module.exports = router;