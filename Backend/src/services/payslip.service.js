const Payslip = require("../models/Payslip");
const ApiError = require("../utils/ApiError");

const getPayslipById = async (payslipId) => {
  const payslip = await Payslip.findById(payslipId)
    .populate("employee", "employeeCode firstName lastName email")
    .populate("payrun", "name periodStart periodEnd payDate status");

  if (!payslip) {
    throw new ApiError(404, "Payslip not found");
  }

  return payslip;
};

const getPayslips = async ({ employeeId, payrunId, status }) => {
  const filter = {};

  if (employeeId) {
    filter.employee = employeeId;
  }

  if (payrunId) {
    filter.payrun = payrunId;
  }

  if (status) {
    filter.status = status;
  }

  return Payslip.find(filter)
    .populate("employee", "employeeCode firstName lastName email")
    .populate("payrun", "name periodStart periodEnd payDate status")
    .sort({ periodEnd: -1, createdAt: -1 });
};

module.exports = {
  getPayslipById,
  getPayslips,
};