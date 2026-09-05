const bcrypt = require("bcryptjs");

const User = require("../models/user");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../utils/jwt");

const registerUser = async ({
  email,
  password,
  role,
  employeeId,
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  if (employeeId) {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }

    const employeeUser = await User.findOne({
      employee: employeeId,
    });

    if (employeeUser) {
      throw new ApiError(
        409,
        "This employee already has a user account"
      );
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    email: normalizedEmail,
    password: hashedPassword,
    role: role || "EMPLOYEE",
    employee: employeeId || null,
  });

  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      employee: user.employee,
      isActive: user.isActive,
    },
    token,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken({
    userId: user._id,
    role: user.role,
  });

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      employee: user.employee,
      isActive: user.isActive,
    },
    token,
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId)
    .populate("employee")
    .select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};