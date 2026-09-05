const { z } = require("zod");

const createEmployeeSchema = z.object({
  employeeCode: z.string().min(1).max(50),

  firstName: z.string().min(1).max(100),

  lastName: z.string().min(1).max(100),

  email: z.string().email(),

  phone: z.string().optional(),

  dateOfBirth: z.string().optional(),

  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
    .optional(),

  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),

  department: z.string().min(1).max(100),

  designation: z.string().min(1).max(100),

  dateOfJoining: z.string(),

  manager: z.string().optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};