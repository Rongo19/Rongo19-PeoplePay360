const asyncHandler = require("../utils/asyncHandler");
const timeoffService = require("../services/timeoff.service");

const {
  timeOffTypeSchema,
  updateTimeOffTypeSchema,
  allocationSchema,
  requestSchema,
  rejectRequestSchema,
} = require("../validators/timeoff.validator");

// ======================================================
// TIME OFF TYPES
// ======================================================

const createTimeOffType = asyncHandler(async (req, res) => {
  const data = timeOffTypeSchema.parse(req.body);

  const result = await timeoffService.createTimeOffType(data);

  res.status(201).json({
    success: true,
    message: "Time off type created successfully",
    data: result,
  });
});

const getTimeOffTypes = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";

  const result = await timeoffService.getTimeOffTypes(includeInactive);

  res.status(200).json({
    success: true,
    data: result,
  });
});

const updateTimeOffType = asyncHandler(async (req, res) => {
  const data = updateTimeOffTypeSchema.parse(req.body);

  const result = await timeoffService.updateTimeOffType(
    req.params.id,
    data
  );

  res.status(200).json({
    success: true,
    message: "Time off type updated successfully",
    data: result,
  });
});

// ======================================================
// ALLOCATIONS
// ======================================================

const createAllocation = asyncHandler(async (req, res) => {
  const data = allocationSchema.parse(req.body);

  const result = await timeoffService.createAllocation(data);

  res.status(201).json({
    success: true,
    message: "Time off allocation created successfully",
    data: result,
  });
});

const getAllocations = asyncHandler(async (req, res) => {
  const result = await timeoffService.getAllocations({
    employeeId: req.query.employeeId,
    year: req.query.year
      ? Number(req.query.year)
      : undefined,
    timeOffTypeId: req.query.timeOffTypeId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getEmployeeBalance = asyncHandler(async (req, res) => {
  const year = req.query.year
    ? Number(req.query.year)
    : new Date().getFullYear();

  const result = await timeoffService.getEmployeeBalance(
    req.params.employeeId,
    year
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

// ======================================================
// REQUESTS
// ======================================================

const createRequest = asyncHandler(async (req, res) => {
  const data = requestSchema.parse(req.body);

  const result = await timeoffService.createRequest(
    data,
    req.user
  );

  res.status(201).json({
    success: true,
    message:
      result.status === "APPROVED"
        ? "Time off request approved automatically"
        : "Time off request submitted successfully",
    data: result,
  });
});

const getRequests = asyncHandler(async (req, res) => {
  const result = await timeoffService.getRequests({
    user: req.user,
    employeeId: req.query.employeeId,
    status: req.query.status,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

const getRequestById = asyncHandler(async (req, res) => {
  const result = await timeoffService.getRequestById(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

const approveRequest = asyncHandler(async (req, res) => {
  const result = await timeoffService.approveRequest(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Time off request approved successfully",
    data: result,
  });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const data = rejectRequestSchema.parse(req.body);

  const result = await timeoffService.rejectRequest(
    req.params.id,
    data.rejectionReason
  );

  res.status(200).json({
    success: true,
    message: "Time off request rejected successfully",
    data: result,
  });
});

const cancelRequest = asyncHandler(async (req, res) => {
  const result = await timeoffService.cancelRequest(
    req.params.id,
    req.user
  );

  res.status(200).json({
    success: true,
    message: "Time off request cancelled successfully",
    data: result,
  });
});

module.exports = {
  createTimeOffType,
  getTimeOffTypes,
  updateTimeOffType,
  createAllocation,
  getAllocations,
  getEmployeeBalance,
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  cancelRequest,
};