const asyncHandler = require("../utils/asyncHandler");

const dashboardService = require("../services/dashboard.service");

const getFilters = (req) => ({
  month: req.query.month,
  department: req.query.department,
});

// OVERVIEW
const getOverview = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOverview(
    getFilters(req)
  );

  res.status(200).json({
    success: true,
    data,
  });
});

// EMPLOYEE SUMMARY
const getEmployeeSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getEmployeeSummary(
    getFilters(req)
  );

  res.status(200).json({
    success: true,
    data,
  });
});

// PAYROLL SUMMARY
const getPayrollSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getPayrollSummary(
    getFilters(req)
  );

  res.status(200).json({
    success: true,
    data,
  });
});

// RECENT PAYSLIPS
const getRecentPayslips = asyncHandler(async (req, res) => {
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    50
  );

  const data = await dashboardService.getRecentPayslips(
    limit,
    getFilters(req)
  );

  res.status(200).json({
    success: true,
    data,
  });
});

// LEAVE SUMMARY
const getLeaveSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLeaveSummary(
    getFilters(req)
  );

  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getOverview,
  getEmployeeSummary,
  getPayrollSummary,
  getRecentPayslips,
  getLeaveSummary,
};