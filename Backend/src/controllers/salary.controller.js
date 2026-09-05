const asyncHandler = require("../utils/asyncHandler");

const salaryService = require("../services/salary.service");

const {
  salaryStructureSchema,
  updateSalaryStructureSchema,
  salaryRuleSchema,
  updateSalaryRuleSchema,
} = require("../validators/salary.validator");

// ======================================================
// SALARY STRUCTURES
// ======================================================

const createSalaryStructure = asyncHandler(
  async (req, res) => {
    const data = salaryStructureSchema.parse(
      req.body
    );

    const result =
      await salaryService.createSalaryStructure(data);

    res.status(201).json({
      success: true,
      message:
        "Salary structure created successfully",
      data: result,
    });
  }
);

const getSalaryStructures = asyncHandler(
  async (req, res) => {
    const includeInactive =
      req.query.includeInactive === "true";

    const result =
      await salaryService.getSalaryStructures({
        includeInactive,
      });

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

const getSalaryStructureById = asyncHandler(
  async (req, res) => {
    const result =
      await salaryService.getSalaryStructureById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

const updateSalaryStructure = asyncHandler(
  async (req, res) => {
    const data =
      updateSalaryStructureSchema.parse(req.body);

    const result =
      await salaryService.updateSalaryStructure(
        req.params.id,
        data
      );

    res.status(200).json({
      success: true,
      message:
        "Salary structure updated successfully",
      data: result,
    });
  }
);

// ======================================================
// SALARY RULES
// ======================================================

const createSalaryRule = asyncHandler(
  async (req, res) => {
    const data = salaryRuleSchema.parse(
      req.body
    );

    const result =
      await salaryService.createSalaryRule(data);

    res.status(201).json({
      success: true,
      message:
        "Salary rule created successfully",
      data: result,
    });
  }
);

const getSalaryRules = asyncHandler(
  async (req, res) => {
    const includeInactive =
      req.query.includeInactive === "true";

    const result =
      await salaryService.getSalaryRules({
        salaryStructureId:
          req.query.salaryStructureId,
        includeInactive,
      });

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

const getSalaryRuleById = asyncHandler(
  async (req, res) => {
    const result =
      await salaryService.getSalaryRuleById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

const updateSalaryRule = asyncHandler(
  async (req, res) => {
    const data =
      updateSalaryRuleSchema.parse(req.body);

    const result =
      await salaryService.updateSalaryRule(
        req.params.id,
        data
      );

    res.status(200).json({
      success: true,
      message:
        "Salary rule updated successfully",
      data: result,
    });
  }
);

const deactivateSalaryRule = asyncHandler(
  async (req, res) => {
    const result =
      await salaryService.deactivateSalaryRule(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Salary rule deactivated successfully",
      data: result,
    });
  }
);

module.exports = {
  createSalaryStructure,
  getSalaryStructures,
  getSalaryStructureById,
  updateSalaryStructure,

  createSalaryRule,
  getSalaryRules,
  getSalaryRuleById,
  updateSalaryRule,
  deactivateSalaryRule,
};