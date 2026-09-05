const { z } = require("zod");

const createContractSchema = z.object({
  employee: z.string().min(1),

  contractNumber: z.string().min(1).max(50),

  contractType: z
    .enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "TEMPORARY",
      "INTERN",
    ])
    .optional(),

  startDate: z.string(),

  endDate: z.string().optional(),

  salaryStructure: z.string().min(1),

  workingSchedule: z.string().optional(),

  notes: z.string().optional(),
});

const updateContractSchema = z.object({
  contractNumber: z.string().min(1).max(50).optional(),

  contractType: z
    .enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "TEMPORARY",
      "INTERN",
    ])
    .optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  salaryStructure: z.string().optional(),

  workingSchedule: z.string().optional(),

  notes: z.string().optional(),
});

module.exports = {
  createContractSchema,
  updateContractSchema,
};