const { z } = require("zod");

const workingDaySchema = z.object({
  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),

  isWorkingDay: z.boolean().optional(),

  startTime: z.string().optional(),

  endTime: z.string().optional(),

  breakMinutes: z.number().min(0).optional(),

  expectedHours: z.number().min(0).optional(),
});

const createScheduleSchema = z.object({
  name: z.string().min(1).max(100),

  description: z.string().optional(),

  employee: z.string().optional(),

  weeklySchedule: z
    .array(workingDaySchema)
    .min(1)
    .max(7),

  totalWeeklyHours: z.number().min(0).optional(),

  effectiveFrom: z.string(),

  effectiveTo: z.string().optional(),
});

const updateScheduleSchema = createScheduleSchema.partial();

module.exports = {
  createScheduleSchema,
  updateScheduleSchema,
};