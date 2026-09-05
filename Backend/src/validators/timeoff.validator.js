const { z } = require("zod");

const objectIdSchema = z.string().min(1);

const timeOffTypeSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(20),
  description: z.string().max(500).optional().nullable(),
  isPaid: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const updateTimeOffTypeSchema = timeOffTypeSchema.partial();

const allocationSchema = z.object({
  employeeId: objectIdSchema,
  timeOffTypeId: objectIdSchema,
  year: z.number().int().min(2000).max(2100),
  allocatedDays: z.number().min(0),
  carriedForwardDays: z.number().min(0).optional(),
  adjustmentDays: z.number().optional(),
  notes: z.string().max(500).optional().nullable(),
});

const requestSchema = z.object({
  employeeId: objectIdSchema.optional(),
  timeOffTypeId: objectIdSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  requestedDays: z.number().positive(),
  reason: z.string().max(1000).optional().nullable(),
});

const rejectRequestSchema = z.object({
  rejectionReason: z.string().min(2).max(500),
});

module.exports = {
  timeOffTypeSchema,
  updateTimeOffTypeSchema,
  allocationSchema,
  requestSchema,
  rejectRequestSchema,
};