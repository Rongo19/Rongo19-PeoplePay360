const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email(),

  password: z.string().min(6),

  role: z
    .enum([
      "EMPLOYEE",
      "HR_MANAGER",
      "HR_PAYROLL_USER",
      "HR_PAYROLL_MANAGER",
      "ADMIN",
    ])
    .optional(),

  employeeId: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),

  password: z.string().min(1),
});

module.exports = {
  registerSchema,
  loginSchema,
};