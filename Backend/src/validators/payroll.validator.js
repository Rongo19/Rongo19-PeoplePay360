const { z } = require("zod");

const payrollPeriodSchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  employeeIds: z.array(z.string().min(1)).optional(),
  payDate: z.coerce.date().optional().nullable(),
});

const createPayrunSchema = payrollPeriodSchema.extend({
  name: z.string().min(2).max(100),
});

module.exports = {
  payrollPeriodSchema,
  createPayrunSchema,
};