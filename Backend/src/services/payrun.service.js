const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const {
  calculateSalary,
} = require("./payroll.service");

const validatePeriod = (
  periodStart,
  periodEnd
) => {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new ApiError(
      400,
      "Invalid payroll period"
    );
  }

  if (start >= end) {
    throw new ApiError(
      400,
      "Payroll period start must be before period end"
    );
  }

  return { start, end };
};

// ======================================================
// PREVIEW
// ======================================================

const previewPayrun = async ({
  periodStart,
  periodEnd,
  employeeIds,
}) => {
  const { start, end } = validatePeriod(
    periodStart,
    periodEnd
  );

  const filter = {
    employmentStatus: {
      $in: ["ACTIVE", "ON_LEAVE"],
    },
  };

  if (employeeIds?.length) {
    filter._id = { $in: employeeIds };
  }

  const employees = await Employee.find(filter).sort({
    employeeCode: 1,
  });

  if (employees.length === 0) {
    throw new ApiError(
      404,
      "No employees found for this payroll"
    );
  }

  const results = [];

  for (const employee of employees) {
    const result = await calculateSalary({
      employee,
      periodStart: start,
      periodEnd: end,
    });

    results.push({
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
      },
      ...result,
    });
  }

  const validResults = results.filter(
    (result) => result.success
  );

  const warnings = results.flatMap(
    (result) =>
      result.warnings?.map(
        (warning) =>
          `${result.employee.employeeCode}: ${warning}`
      ) || []
  );

  return {
    periodStart: start,
    periodEnd: end,

    totalEmployees: results.length,

    totalGross: validResults.reduce(
      (sum, item) => sum + item.grossSalary,
      0
    ),

    totalDeductions: validResults.reduce(
      (sum, item) => sum + item.totalDeductions,
      0
    ),

    totalNet: validResults.reduce(
      (sum, item) => sum + item.netSalary,
      0
    ),

    warnings,

    employees: results,
  };
};

// ======================================================
// CREATE PAYRUN
// ======================================================

const createPayrun = async ({
  name,
  periodStart,
  periodEnd,
  payDate,
  employeeIds,
  createdBy,
}) => {
  const { start, end } = validatePeriod(
    periodStart,
    periodEnd
  );

  const existingPayrun =
    await Payrun.findOne({
      periodStart: start,
      periodEnd: end,
    });

  if (existingPayrun) {
    throw new ApiError(
      409,
      "A payrun already exists for this payroll period"
    );
  }

  const filter = {
    employmentStatus: {
      $in: ["ACTIVE", "ON_LEAVE"],
    },
  };

  if (employeeIds?.length) {
    filter._id = { $in: employeeIds };
  }

  const employees =
    await Employee.find(filter).select("_id");

  if (employees.length === 0) {
    throw new ApiError(
      400,
      "No eligible employees selected"
    );
  }

  const payrun = await Payrun.create({
    name,
    periodStart: start,
    periodEnd: end,
    payDate: payDate || null,
    status: "DRAFT",
    employees: employees.map(
      (employee) => employee._id
    ),
    totalEmployees: employees.length,
    createdBy,
  });

  return payrun;
};

// ======================================================
// GET PAYRUNS
// ======================================================

const getPayruns = async () => {
  return Payrun.find()
    .populate(
      "createdBy",
      "email role"
    )
    .sort({
      periodStart: -1,
      createdAt: -1,
    });
};

const getPayrunById = async (id) => {
  const payrun = await Payrun.findById(id)
    .populate(
      "createdBy",
      "email role"
    )
    .populate(
      "employees",
      "employeeCode firstName lastName email"
    );

  if (!payrun) {
    throw new ApiError(
      404,
      "Payrun not found"
    );
  }

  const payslips = await Payslip.find({
    payrun: id,
  })
    .populate(
      "employee",
      "employeeCode firstName lastName email"
    )
    .sort({
      "employee.employeeCode": 1,
    });

  return {
    payrun,
    payslips,
  };
};

// ======================================================
// COMPUTE PAYRUN
// ======================================================

const computePayrun = async (id) => {
  const payrun = await Payrun.findById(id);

  if (!payrun) {
    throw new ApiError(
      404,
      "Payrun not found"
    );
  }

  if (
    !["DRAFT", "COMPUTED"].includes(
      payrun.status
    )
  ) {
    throw new ApiError(
      400,
      `Cannot compute payrun with status ${payrun.status}`
    );
  }

  /*
   * Remove old draft/computed payslips so that
   * recomputing the same draft payrun is safe.
   */
  await Payslip.deleteMany({
    payrun: payrun._id,
    status: "DRAFT",
  });

  const employees =
    await Employee.find({
      _id: { $in: payrun.employees },
    }).sort({
      employeeCode: 1,
    });

  const warnings = [];

  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  for (const employee of employees) {
    const result =
      await calculateSalary({
        employee,
        periodStart: payrun.periodStart,
        periodEnd: payrun.periodEnd,
      });

    if (!result.success) {
      warnings.push(
        `${employee.employeeCode}: ${
          result.warnings?.join(", ") ||
          "Payroll calculation failed"
        }`
      );

      continue;
    }

    const payslip =
      await Payslip.create({
        employee: employee._id,
        payrun: payrun._id,

        periodStart: payrun.periodStart,
        periodEnd: payrun.periodEnd,
        payDate: payrun.payDate,

        employeeSnapshot: {
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
        },

        contractSnapshot: {
          contractNumber:
            result.contract.contractNumber,
          contractType:
            result.contract.contractType,
          startDate:
            result.contract.startDate,
          endDate:
            result.contract.endDate,
        },

        salaryStructureSnapshot: {
          name: result.salaryStructure.name,
          code: result.salaryStructure.code,
          payFrequency:
            result.salaryStructure.payFrequency,
          currency:
            result.salaryStructure.currency,
        },

        earnings: result.earnings,
        deductions: result.deductions,

        grossSalary: result.grossSalary,
        totalDeductions:
          result.totalDeductions,
        netSalary: result.netSalary,

        workingDays:
          result.attendance.workingDays,

        workedDays:
          result.attendance.workedDays,

        unpaidLeaveDays:
          result.leave.unpaidLeaveDays,

        status: "DRAFT",

        warnings: result.warnings,
      });

    totalGross += result.grossSalary;
    totalDeductions +=
      result.totalDeductions;
    totalNet += result.netSalary;

    if (result.warnings?.length) {
      warnings.push(
        ...result.warnings.map(
          (warning) =>
            `${employee.employeeCode}: ${warning}`
        )
      );
    }
  }

  payrun.totalEmployees = employees.length;
  payrun.totalGross = totalGross;
  payrun.totalDeductions =
    totalDeductions;
  payrun.totalNet = totalNet;
  payrun.warnings = warnings;
  payrun.status = "COMPUTED";
  payrun.computedAt = new Date();

  await payrun.save();

  return getPayrunById(id);
};

// ======================================================
// VALIDATE PAYRUN
// ======================================================

const validatePayrun = async (id) => {
  const payrun = await Payrun.findById(id);

  if (!payrun) {
    throw new ApiError(
      404,
      "Payrun not found"
    );
  }

  if (payrun.status !== "COMPUTED") {
    throw new ApiError(
      400,
      "Only a computed payrun can be validated"
    );
  }

  const payslips =
    await Payslip.find({
      payrun: id,
    });

  if (payslips.length === 0) {
    throw new ApiError(
      400,
      "Cannot validate payrun without payslips"
    );
  }

  const validationWarnings = [];

  for (const payslip of payslips) {
    if (payslip.netSalary < 0) {
      validationWarnings.push(
        `${payslip.employee}: Net salary cannot be negative`
      );
    }

    if (
      payslip.grossSalary === 0
    ) {
      validationWarnings.push(
        `${payslip.employee}: Gross salary is zero`
      );
    }
  }

  if (validationWarnings.length) {
    payrun.warnings = [
      ...payrun.warnings,
      ...validationWarnings,
    ];

    await payrun.save();

    throw new ApiError(
      400,
      "Payrun validation failed. Check warnings."
    );
  }

  payrun.status = "VALIDATED";
  payrun.validatedAt = new Date();

  await payrun.save();

  await Payslip.updateMany(
    { payrun: id },
    { status: "FINAL" }
  );

  return getPayrunById(id);
};

// ======================================================
// MARK PAID
// ======================================================

const markPayrunPaid = async (id) => {
  const payrun = await Payrun.findById(id);

  if (!payrun) {
    throw new ApiError(
      404,
      "Payrun not found"
    );
  }

  if (payrun.status !== "VALIDATED") {
    throw new ApiError(
      400,
      "Only a validated payrun can be marked as paid"
    );
  }

  payrun.status = "PAID";
  payrun.paidAt = new Date();

  await payrun.save();

  await Payslip.updateMany(
    { payrun: id },
    { status: "PAID" }
  );

  return getPayrunById(id);
};

module.exports = {
  previewPayrun,
  createPayrun,
  getPayruns,
  getPayrunById,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
};