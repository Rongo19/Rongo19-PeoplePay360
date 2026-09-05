const SalaryStructure = require("../models/SalaryStructure");
const SalaryRule = require("../models/SalaryRule");
const ApiError = require("../utils/ApiError");

// ======================================================
// SALARY STRUCTURES
// ======================================================

const createSalaryStructure = async (data) => {
  const normalizedCode = data.code.toUpperCase().trim();

  const existing = await SalaryStructure.findOne({
    $or: [
      { name: data.name.trim() },
      { code: normalizedCode },
    ],
  });

  if (existing) {
    throw new ApiError(
      409,
      "Salary structure with this name or code already exists"
    );
  }

  return SalaryStructure.create({
    name: data.name.trim(),
    code: normalizedCode,
    description: data.description || null,
    payFrequency: data.payFrequency || "MONTHLY",
    currency: (data.currency || "INR").toUpperCase(),
    isActive: data.isActive ?? true,
    rules: [],
  });
};

const getSalaryStructures = async ({
  includeInactive = false,
}) => {
  const filter = includeInactive
    ? {}
    : { isActive: true };

  return SalaryStructure.find(filter)
    .populate({
      path: "rules",
      options: {
        sort: { sequence: 1 },
      },
    })
    .sort({ name: 1 });
};

const getSalaryStructureById = async (id) => {
  const structure = await SalaryStructure.findById(id)
    .populate({
      path: "rules",
      options: {
        sort: { sequence: 1 },
      },
    });

  if (!structure) {
    throw new ApiError(
      404,
      "Salary structure not found"
    );
  }

  return structure;
};

const updateSalaryStructure = async (id, data) => {
  const structure = await SalaryStructure.findById(id);

  if (!structure) {
    throw new ApiError(
      404,
      "Salary structure not found"
    );
  }

  if (data.name || data.code) {
    const duplicateConditions = [];

    if (data.name) {
      duplicateConditions.push({
        name: data.name.trim(),
      });
    }

    if (data.code) {
      duplicateConditions.push({
        code: data.code.toUpperCase().trim(),
      });
    }

    const duplicate = await SalaryStructure.findOne({
      _id: { $ne: id },
      $or: duplicateConditions,
    });

    if (duplicate) {
      throw new ApiError(
        409,
        "Another salary structure already uses this name or code"
      );
    }
  }

  if (data.name) {
    data.name = data.name.trim();
  }

  if (data.code) {
    data.code = data.code.toUpperCase().trim();
  }

  if (data.currency) {
    data.currency = data.currency.toUpperCase();
  }

  Object.assign(structure, data);

  await structure.save();

  return getSalaryStructureById(id);
};

// ======================================================
// SALARY RULES
// ======================================================

const validateRuleConfiguration = (data) => {
  if (data.calculationType === "FIXED") {
    if (
      data.amount === undefined ||
      data.amount === null
    ) {
      throw new ApiError(
        400,
        "Fixed salary rule requires an amount"
      );
    }
  }

  if (data.calculationType === "PERCENTAGE") {
    if (
      data.percentage === undefined ||
      data.percentage === null
    ) {
      throw new ApiError(
        400,
        "Percentage salary rule requires a percentage"
      );
    }

    if (data.percentage > 100) {
      throw new ApiError(
        400,
        "Percentage cannot exceed 100"
      );
    }
  }

  if (data.calculationType === "FORMULA") {
    if (!data.formula) {
      throw new ApiError(
        400,
        "Formula salary rule requires a formula"
      );
    }
  }
};

const createSalaryRule = async (data) => {
  validateRuleConfiguration(data);

  const structure = await SalaryStructure.findById(
    data.salaryStructureId
  );

  if (!structure) {
    throw new ApiError(
      404,
      "Salary structure not found"
    );
  }

  if (!structure.isActive) {
    throw new ApiError(
      400,
      "Cannot add a rule to an inactive salary structure"
    );
  }

  const normalizedCode = data.code.toUpperCase().trim();

  const existingCode = await SalaryRule.findOne({
    salaryStructure: data.salaryStructureId,
    code: normalizedCode,
  });

  if (existingCode) {
    throw new ApiError(
      409,
      "A salary rule with this code already exists in this structure"
    );
  }

  const existingSequence = await SalaryRule.findOne({
    salaryStructure: data.salaryStructureId,
    sequence: data.sequence,
  });

  if (existingSequence) {
    throw new ApiError(
      409,
      `Sequence ${data.sequence} is already used in this salary structure`
    );
  }

  const rule = await SalaryRule.create({
    salaryStructure: data.salaryStructureId,
    name: data.name.trim(),
    code: normalizedCode,
    category: data.category,
    calculationType: data.calculationType,
    amount:
      data.calculationType === "FIXED"
        ? data.amount
        : 0,
    percentage:
      data.calculationType === "PERCENTAGE"
        ? data.percentage
        : 0,
    formula:
      data.calculationType === "FORMULA"
        ? data.formula
        : null,
    sequence: data.sequence,
    isActive: data.isActive ?? true,
    description: data.description || null,
  });

  // Keep the structure's rules array synchronized.
  await SalaryStructure.findByIdAndUpdate(
    data.salaryStructureId,
    {
      $addToSet: {
        rules: rule._id,
      },
    }
  );

  return rule;
};

const getSalaryRules = async ({
  salaryStructureId,
  includeInactive = false,
}) => {
  const filter = {};

  if (salaryStructureId) {
    filter.salaryStructure = salaryStructureId;
  }

  if (!includeInactive) {
    filter.isActive = true;
  }

  return SalaryRule.find(filter)
    .populate(
      "salaryStructure",
      "name code payFrequency currency"
    )
    .sort({
      salaryStructure: 1,
      sequence: 1,
    });
};

const getSalaryRuleById = async (id) => {
  const rule = await SalaryRule.findById(id).populate(
    "salaryStructure",
    "name code payFrequency currency"
  );

  if (!rule) {
    throw new ApiError(
      404,
      "Salary rule not found"
    );
  }

  return rule;
};

const updateSalaryRule = async (id, data) => {
  const rule = await SalaryRule.findById(id);

  if (!rule) {
    throw new ApiError(
      404,
      "Salary rule not found"
    );
  }

  const calculationType =
    data.calculationType || rule.calculationType;

  const mergedData = {
    ...rule.toObject(),
    ...data,
    calculationType,
  };

  validateRuleConfiguration(mergedData);

  if (data.code) {
    const normalizedCode =
      data.code.toUpperCase().trim();

    const duplicate = await SalaryRule.findOne({
      _id: { $ne: id },
      salaryStructure: rule.salaryStructure,
      code: normalizedCode,
    });

    if (duplicate) {
      throw new ApiError(
        409,
        "Another salary rule already uses this code"
      );
    }

    data.code = normalizedCode;
  }

  if (data.sequence !== undefined) {
    const duplicateSequence =
      await SalaryRule.findOne({
        _id: { $ne: id },
        salaryStructure: rule.salaryStructure,
        sequence: data.sequence,
      });

    if (duplicateSequence) {
      throw new ApiError(
        409,
        `Sequence ${data.sequence} is already used`
      );
    }
  }

  if (data.name) {
    data.name = data.name.trim();
  }

  Object.assign(rule, data);

  await rule.save();

  return getSalaryRuleById(id);
};

// ======================================================
// DEACTIVATE RULE
// ======================================================

const deactivateSalaryRule = async (id) => {
  const rule = await SalaryRule.findById(id);

  if (!rule) {
    throw new ApiError(
      404,
      "Salary rule not found"
    );
  }

  rule.isActive = false;

  await rule.save();

  return rule;
};

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