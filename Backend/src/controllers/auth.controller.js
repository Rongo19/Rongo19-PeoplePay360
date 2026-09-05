const authService = require("../services/auth.service");
const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validator");

const register = async (req, res) => {
  const data = registerSchema.parse(req.body);

  const result = await authService.registerUser(data);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

const login = async (req, res) => {
  const data = loginSchema.parse(req.body);

  const result = await authService.loginUser(data);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

const me = async (req, res) => {
  const user = await authService.getCurrentUser(
    req.user.userId
  );

  res.status(200).json({
    success: true,
    data: user,
  });
};

module.exports = {
  register,
  login,
  me,
};