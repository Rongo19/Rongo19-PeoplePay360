const Attendance = require("../models/Attendance");
const TimeOffRequest = require("../models/TimeOffRequest");
const Contract = require("../models/Contract");
const SalaryRule = require("../models/SalaryRule");
const ApiError = require("../utils/ApiError");

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/*
 * Evaluate a restricted arithmetic formula.
 *
 * Supported variables are salary rule codes and:
 * BASIC, GROSS, NET
 *
 * Example:
 * BASIC * 0.4
 * BASIC + HRA
 * GROSS * 0.12
 */
const evaluateFormula = (formula, variables) => {
  if (!formula || typeof formula !== "string") {
    throw new ApiError(400, "Invalid salary formula");
  }

  // Only allow arithmetic, spaces, decimal numbers,
  // parentheses and uppercase variable names.
  const normalizedFormula = formula
    .toUpperCase()
    .trim();

  if (!/^[A-Z0-9_+\-*/().\s]+$/.test(normalizedFormula)) {
    throw new ApiError(
      400,
      `Invalid characters in salary formula: ${formula}`
    );
  }

  const expression = normalizedFormula.replace(
    /\b[A-Z][A-Z0-9_]*\b/g,
    (variable) => {
      if (!(variable in variables)) {
        throw new ApiError(
          400,
          `Unknown salary variable: ${variable}`
        );
      }

      return String(Number(variables[variable]) || 0);
    }
  );

  try {
    // Expression has already been restricted to arithmetic
    // characters and known numeric variables.
    const result = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(result) || result < 0) {
      throw new Error("Invalid calculation result");
    }

    return roundMoney(result);
  } catch (error) {
    throw new ApiError(
      400,
      `Unable to evaluate salary formula: ${formula}`
    );
  }
};

const getAttendanceSummary = async (
  employeeId,
  periodStart,
  periodEnd
) => {
  const records = await Attendance.find({
    employee: employeeId,
    date: {
      $gte: periodStart,
      $lte: periodEnd,
    },
  }).sort({ date: 1 });

  let workingDays = 0;
  let workedDays = 0;
  let totalWorkedHours = 0;
  let totalExpectedHours = 0;

  for (const record of records) {
    if (
      record.status !== "WEEKEND" &&
      record.status !== "HOLIDAY"
    ) {
      workingDays++;
    }

    if (
      record.status === "PRESENT" ||
      record.status === "HALF_DAY"
    ) {
      workedDays++;
    }

    totalWorkedHours += record.workedHours || 0;
    totalExpectedHours += record.expectedHours || 0;
  }

  return {
    workingDays,
    workedDays,
    totalWorkedHours: roundMoney(totalWorkedHours),
    totalExpectedHours: roundMoney(totalExpectedHours),
  };
};

const getLeaveSummary = async (
  employeeId,
  periodStart,
  periodEnd
) => {
  const approvedLeaves = await TimeOffRequest.find({
    employee: employeeId,
    status: "APPROVED",
    startDate: { $lte: periodEnd },
    endDate: { $gte: periodStart },
  }).populate("timeOffType", "name code isPaid");

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;

  for (const leave of approvedLeaves) {
    if (leave.timeOffType?.isPaid) {
      paidLeaveDays += leave.requestedDays;
    } else {
      unpaidLeaveDays += leave.requestedDays;
    }
  }

  return {
    paidLeaveDays: roundMoney(paidLeaveDays),
    unpaidLeaveDays: roundMoney(unpaidLeaveDays),
    leaves: approvedLeaves,
  };
};

const calculateSalary = async ({
  employee,
  periodStart,
  periodEnd,
}) => {
  const contract =
    await Contract.findOne({
      employee: employee._id,
      startDate: { $lte: periodEnd },
      $or: [
        { endDate: null },
        { endDate: { $gte: periodStart } },
      ],
      status: {
        $in: ["ACTIVE", "EXPIRED"],
      },
    })
      .sort({ startDate: -1 })
      .populate({
        path: "salaryStructure",
      })
      .populate("workingSchedule");

  if (!contract) {
    return {
      employee: employee._id,
      success: false,
      warnings: [
        "No applicable contract found for payroll period",
      ],
    };
  }

  if (!contract.salaryStructure) {
    return {
      employee: employee._id,
      success: false,
      warnings: [
        "Contract has no salary structure",
      ],
    };
  }

  const salaryStructure = contract.salaryStructure;

  const rules = await SalaryRule.find({
    salaryStructure: salaryStructure._id,
    isActive: true,
  }).sort({ sequence: 1 });

  if (rules.length === 0) {
    return {
      employee: employee._id,
      success: false,
      warnings: [
        "Salary structure has no active salary rules",
      ],
    };
  }

  const attendance = await getAttendanceSummary(
    employee._id,
    periodStart,
    periodEnd
  );

  const leave = await getLeaveSummary(
    employee._id,
    periodStart,
    periodEnd
  );

  const variables = {
    WORKING_DAYS: attendance.workingDays,
    WORKED_DAYS: attendance.workedDays,
    WORKED_HOURS: attendance.totalWorkedHours,
    EXPECTED_HOURS: attendance.totalExpectedHours,
    PAID_LEAVE: leave.paidLeaveDays,
    UNPAID_LEAVE: leave.unpaidLeaveDays,
  };

  const earnings = [];
  const deductions = [];

  let grossSalary = 0;
  let totalDeductions = 0;

  for (const rule of rules) {
    let amount = 0;

    if (rule.calculationType === "FIXED") {
      amount = rule.amount || 0;
    }

    if (rule.calculationType === "PERCENTAGE") {
      /*
       * Percentage rules use the current gross/earnings
       * as their calculation base.
       *
       * For a specific base such as PF = 12% of BASIC,
       * use a FORMULA rule:
       *
       * BASIC * 0.12
       */
      const base =
        rule.category === "EARNING"
          ? grossSalary
          : grossSalary;

      amount = (base * (rule.percentage || 0)) / 100;
    }

    if (rule.calculationType === "FORMULA") {
      variables.GROSS = grossSalary;
      variables.NET =
        grossSalary - totalDeductions;

      amount = evaluateFormula(
        rule.formula,
        variables
      );
    }

    amount = roundMoney(amount);

    variables[rule.code] = amount;

    const line = {
      name: rule.name,
      code: rule.code,
      category: rule.category,
      amount,
      sequence: rule.sequence,
    };

    if (rule.category === "EARNING") {
      earnings.push(line);
      grossSalary = roundMoney(
        grossSalary + amount
      );
    } else {
      deductions.push(line);
      totalDeductions = roundMoney(
        totalDeductions + amount
      );
    }
  }

  /*
   * Optional unpaid-leave adjustment.
   *
   * We surface unpaid leave in the payslip data.
   * Actual deduction can be represented by a salary rule
   * if the hackathon wants a configurable formula.
   */

  const netSalary = roundMoney(
    Math.max(0, grossSalary - totalDeductions)
  );

  const warnings = [];

  if (attendance.workingDays === 0) {
    warnings.push(
      "No working-day attendance records found"
    );
  }

  if (
    attendance.totalExpectedHours > 0 &&
    attendance.totalWorkedHours <
      attendance.totalExpectedHours
  ) {
    warnings.push(
      "Worked hours are below expected hours"
    );
  }

  if (leave.unpaidLeaveDays > 0) {
    warnings.push(
      `${leave.unpaidLeaveDays} unpaid leave day(s) found`
    );
  }

  return {
    employee: employee._id,
    success: true,

    contract,
    salaryStructure,

    attendance,
    leave,

    earnings,
    deductions,

    grossSalary,
    totalDeductions,
    netSalary,

    warnings,
  };
};

module.exports = {
  calculateSalary,
};