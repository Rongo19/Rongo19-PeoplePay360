const { z } = require("zod");

const createAttendanceSchema = z.object({
  employee: z.string().min(1),

  date: z.string(),

  checkIn: z.string().optional(),

  checkOut: z.string().optional(),

  expectedHours: z.number().min(0).optional(),

  status: z
    .enum([
      "PRESENT",
      "ABSENT",
      "HALF_DAY",
      "ON_LEAVE",
      "HOLIDAY",
      "WEEKEND",
    ])
    .optional(),

  notes: z.string().optional(),
});

const updateAttendanceSchema = z.object({
  checkIn: z.string().optional(),

  checkOut: z.string().optional(),

  expectedHours: z.number().min(0).optional(),

  status: z
    .enum([
      "PRESENT",
      "ABSENT",
      "HALF_DAY",
      "ON_LEAVE",
      "HOLIDAY",
      "WEEKEND",
    ])
    .optional(),

  notes: z.string().optional(),
});

module.exports = {
  createAttendanceSchema,
  updateAttendanceSchema,
};