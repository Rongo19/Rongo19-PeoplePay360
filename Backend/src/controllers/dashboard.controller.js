const asyncHandler = require("../utils/asyncHandler");
const dashboardService = require("../services/dashboard.service");

const getOverview = asyncHandler(async (req, res) => {
  const data = await dashboardService.getOverview();

  res.status(200).json({
    success: true,
    data,
  });
});

const getEmployeeSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getEmployeeSummary();

  res.status(200).json({
    success: true,
    data,
  });
});

const getPayrollSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getPayrollSummary();

  res.status(200).json({
    success: true,
    data,
  });
});

const getRecentPayslips = asyncHandler(async (req, res) => {
  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    50
  );

  const data =
    await dashboardService.getRecentPayslips(limit);

  res.status(200).json({
    success: true,
    data,
  });
});

const getLeaveSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLeaveSummary();

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