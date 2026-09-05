const { z } = require("zod");

const salaryStructureSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30),
  description: z.string().max(500).optional().nullable(),
  payFrequency: z
    .enum(["MONTHLY", "WEEKLY", "BIWEEKLY", "YEARLY"])
    .optional(),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
});

const updateSalaryStructureSchema =
  salaryStructureSchema.partial();

const salaryRuleSchema = z.object({
  salaryStructureId: z.string().min(1),
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30),
  category: z.enum(["EARNING", "DEDUCTION"]),
  calculationType: z.enum([
    "FIXED",
    "PERCENTAGE",
    "FORMULA",
  ]),
  amount: z.number().min(0).optional(),
  percentage: z.number().min(0).optional(),
  formula: z.string().max(500).optional().nullable(),
  sequence: z.number().int().min(1),
  isActive: z.boolean().optional(),
  description: z.string().max(500).optional().nullable(),
});

const updateSalaryRuleSchema =
  salaryRuleSchema.omit({
    salaryStructureId: true,
  }).partial();

module.exports = {
  salaryStructureSchema,
  updateSalaryStructureSchema,
  salaryRuleSchema,
  updateSalaryRuleSchema,
};