const TimeOffType = require("../models/TimeOffType");
const TimeOffAllocation = require("../models/TimeOffAllocation");
const TimeOffRequest = require("../models/TimeOffRequest");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const HR_ROLES = [
  "HR_MANAGER",
  "HR_PAYROLL_USER",
  "HR_PAYROLL_MANAGER",
  "ADMIN",
];

const isHrRole = (role) => HR_ROLES.includes(role);

// ======================================================
// TIME OFF TYPES
// ======================================================

const createTimeOffType = async (data) => {
  const existing = await TimeOffType.findOne({
    $or: [
      { name: data.name.trim() },
      { code: data.code.toUpperCase().trim() },
    ],
  });

  if (existing) {
    throw new ApiError(409, "Time off type with this name or code already exists");
  }

  return TimeOffType.create({
    ...data,
    name: data.name.trim(),
    code: data.code.toUpperCase().trim(),
  });
};

const getTimeOffTypes = async (includeInactive = false) => {
  const filter = includeInactive ? {} : { isActive: true };

  return TimeOffType.find(filter).sort({ name: 1 });
};

const updateTimeOffType = async (id, data) => {
  const timeOffType = await TimeOffType.findById(id);

  if (!timeOffType) {
    throw new ApiError(404, "Time off type not found");
  }

  if (data.name || data.code) {
    const duplicateFilter = {
      _id: { $ne: id },
      $or: [],
    };

    if (data.name) {
      duplicateFilter.$or.push({
        name: data.name.trim(),
      });
    }

    if (data.code) {
      duplicateFilter.$or.push({
        code: data.code.toUpperCase().trim(),
      });
    }

    if (duplicateFilter.$or.length > 0) {
      const duplicate = await TimeOffType.findOne(duplicateFilter);

      if (duplicate) {
        throw new ApiError(
          409,
          "Another time off type already uses this name or code"
        );
      }
    }
  }

  if (data.name) {
    data.name = data.name.trim();
  }

  if (data.code) {
    data.code = data.code.toUpperCase().trim();
  }

  Object.assign(timeOffType, data);

  await timeOffType.save();

  return timeOffType;
};

// ======================================================
// ALLOCATIONS
// ======================================================

const createAllocation = async (data) => {
  const employee = await Employee.findById(data.employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const timeOffType = await TimeOffType.findById(data.timeOffTypeId);

  if (!timeOffType) {
    throw new ApiError(404, "Time off type not found");
  }

  if (!timeOffType.isActive) {
    throw new ApiError(400, "Cannot allocate an inactive time off type");
  }

  const existing = await TimeOffAllocation.findOne({
    employee: data.employeeId,
    timeOffType: data.timeOffTypeId,
    year: data.year,
  });

  if (existing) {
    throw new ApiError(
      409,
      "Allocation already exists for this employee, leave type and year"
    );
  }

  return TimeOffAllocation.create({
    employee: data.employeeId,
    timeOffType: data.timeOffTypeId,
    year: data.year,
    allocatedDays: data.allocatedDays,
    carriedForwardDays: data.carriedForwardDays || 0,
    adjustmentDays: data.adjustmentDays || 0,
    notes: data.notes || null,
  });
};

const getAllocations = async ({ employeeId, year, timeOffTypeId }) => {
  const filter = {};

  if (employeeId) {
    filter.employee = employeeId;
  }

  if (year) {
    filter.year = year;
  }

  if (timeOffTypeId) {
    filter.timeOffType = timeOffTypeId;
  }

  return TimeOffAllocation.find(filter)
    .populate("employee", "employeeCode firstName lastName email")
    .populate("timeOffType", "name code isPaid")
    .sort({ year: -1 });
};

// ======================================================
// BALANCE
// ======================================================

const getEmployeeBalance = async (employeeId, year) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const allocations = await TimeOffAllocation.find({
    employee: employeeId,
    year,
  }).populate("timeOffType", "name code isPaid");

  const balances = [];

  for (const allocation of allocations) {
    const approvedRequests = await TimeOffRequest.aggregate([
      {
        $match: {
          employee: allocation.employee,
          timeOffType: allocation.timeOffType._id,
          status: "APPROVED",
          startDate: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: null,
          usedDays: { $sum: "$requestedDays" },
        },
      },
    ]);

    const usedDays = approvedRequests[0]?.usedDays || 0;

    const totalAllocated =
      allocation.allocatedDays +
      allocation.carriedForwardDays +
      allocation.adjustmentDays;

    balances.push({
      timeOffType: allocation.timeOffType,
      year,
      allocatedDays: allocation.allocatedDays,
      carriedForwardDays: allocation.carriedForwardDays,
      adjustmentDays: allocation.adjustmentDays,
      totalAllocated,
      usedDays,
      remainingDays: totalAllocated - usedDays,
    });
  }

  return balances;
};

// ======================================================
// REQUESTS
// ======================================================

const createRequest = async (data, user) => {
  let employeeId = data.employeeId;

  // Normal employee can only create request for themselves.
  if (!isHrRole(user.role)) {
    employeeId = user.employee;

    if (!employeeId) {
      throw new ApiError(
        400,
        "Your user account is not linked to an employee"
      );
    }
  }

  if (!employeeId) {
    throw new ApiError(400, "Employee ID is required");
  }

  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const timeOffType = await TimeOffType.findById(data.timeOffTypeId);

  if (!timeOffType) {
    throw new ApiError(404, "Time off type not found");
  }

  if (!timeOffType.isActive) {
    throw new ApiError(400, "This time off type is inactive");
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (startDate > endDate) {
    throw new ApiError(400, "Start date cannot be after end date");
  }

  // Keep hackathon payroll periods simple.
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    throw new ApiError(
      400,
      "Leave request cannot span multiple calendar years"
    );
  }

  // Prevent overlapping pending/approved leave.
  const overlappingRequest = await TimeOffRequest.findOne({
    employee: employeeId,
    status: { $in: ["PENDING", "APPROVED"] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  if (overlappingRequest) {
    throw new ApiError(
      409,
      "Employee already has a pending or approved leave during these dates"
    );
  }

  const year = startDate.getFullYear();

  const allocation = await TimeOffAllocation.findOne({
    employee: employeeId,
    timeOffType: data.timeOffTypeId,
    year,
  });

  if (!allocation) {
    throw new ApiError(
      400,
      `No leave allocation found for ${year} for this employee and leave type`
    );
  }

  const approvedRequests = await TimeOffRequest.aggregate([
    {
      $match: {
        employee: employee._id,
        timeOffType: timeOffType._id,
        status: "APPROVED",
        startDate: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: null,
        usedDays: { $sum: "$requestedDays" },
      },
    },
  ]);

  const usedDays = approvedRequests[0]?.usedDays || 0;

  const totalAllocated =
    allocation.allocatedDays +
    allocation.carriedForwardDays +
    allocation.adjustmentDays;

  const remainingDays = totalAllocated - usedDays;

  if (data.requestedDays > remainingDays) {
    throw new ApiError(
      400,
      `Insufficient leave balance. Remaining balance: ${remainingDays} days`
    );
  }

  const status = timeOffType.requiresApproval ? "PENDING" : "APPROVED";

  const request = await TimeOffRequest.create({
    employee: employeeId,
    timeOffType: data.timeOffTypeId,
    startDate,
    endDate,
    requestedDays: data.requestedDays,
    reason: data.reason || null,
    status,
    approvedBy: status === "APPROVED" ? user.userId : null,
    approvedAt: status === "APPROVED" ? new Date() : null,
  });

  return request.populate([
    {
      path: "employee",
      select: "employeeCode firstName lastName email",
    },
    {
      path: "timeOffType",
      select: "name code isPaid requiresApproval",
    },
  ]);
};

const getRequests = async ({
  user,
  employeeId,
  status,
  startDate,
  endDate,
}) => {
  const filter = {};

  if (isHrRole(user.role)) {
    if (employeeId) {
      filter.employee = employeeId;
    }
  } else {
    if (!user.employee) {
      throw new ApiError(
        400,
        "Your user account is not linked to an employee"
      );
    }

    filter.employee = user.employee;
  }

  if (status) {
    filter.status = status;
  }

  if (startDate) {
    filter.startDate = { $gte: new Date(startDate) };
  }

  if (endDate) {
    filter.endDate = {
      ...(filter.endDate || {}),
      $lte: new Date(endDate),
    };
  }

  return TimeOffRequest.find(filter)
    .populate("employee", "employeeCode firstName lastName email")
    .populate("timeOffType", "name code isPaid")
    .populate("approvedBy", "email role")
    .sort({ startDate: -1 });
};

const getRequestById = async (id, user) => {
  const request = await TimeOffRequest.findById(id)
    .populate("employee", "employeeCode firstName lastName email")
    .populate("timeOffType", "name code isPaid requiresApproval")
    .populate("approvedBy", "email role");

  if (!request) {
    throw new ApiError(404, "Time off request not found");
  }

  if (
    !isHrRole(user.role) &&
    String(request.employee._id) !== String(user.employee)
  ) {
    throw new ApiError(403, "You are not allowed to view this request");
  }

  return request;
};

// ======================================================
// APPROVE / REJECT / CANCEL
// ======================================================

const approveRequest = async (id, user) => {
  const request = await TimeOffRequest.findById(id);

  if (!request) {
    throw new ApiError(404, "Time off request not found");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      `Cannot approve a request with status ${request.status}`
    );
  }

  const year = request.startDate.getFullYear();

  const allocation = await TimeOffAllocation.findOne({
    employee: request.employee,
    timeOffType: request.timeOffType,
    year,
  });

  if (!allocation) {
    throw new ApiError(400, "No leave allocation exists for this request");
  }

  const approvedRequests = await TimeOffRequest.aggregate([
    {
      $match: {
        _id: { $ne: request._id },
        employee: request.employee,
        timeOffType: request.timeOffType,
        status: "APPROVED",
        startDate: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: null,
        usedDays: { $sum: "$requestedDays" },
      },
    },
  ]);

  const usedDays = approvedRequests[0]?.usedDays || 0;

  const totalAllocated =
    allocation.allocatedDays +
    allocation.carriedForwardDays +
    allocation.adjustmentDays;

  if (usedDays + request.requestedDays > totalAllocated) {
    throw new ApiError(
      400,
      "Cannot approve request because it exceeds the available leave balance"
    );
  }

  request.status = "APPROVED";
  request.approvedBy = user.userId;
  request.approvedAt = new Date();
  request.rejectionReason = null;

  await request.save();

  return request.populate([
    {
      path: "employee",
      select: "employeeCode firstName lastName email",
    },
    {
      path: "timeOffType",
      select: "name code isPaid",
    },
    {
      path: "approvedBy",
      select: "email role",
    },
  ]);
};

const rejectRequest = async (id, rejectionReason) => {
  const request = await TimeOffRequest.findById(id);

  if (!request) {
    throw new ApiError(404, "Time off request not found");
  }

  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      `Cannot reject a request with status ${request.status}`
    );
  }

  request.status = "REJECTED";
  request.rejectionReason = rejectionReason;
  request.approvedBy = null;
  request.approvedAt = null;

  await request.save();

  return request;
};

const cancelRequest = async (id, user) => {
  const request = await TimeOffRequest.findById(id);

  if (!request) {
    throw new ApiError(404, "Time off request not found");
  }

  if (
    !isHrRole(user.role) &&
    String(request.employee) !== String(user.employee)
  ) {
    throw new ApiError(403, "You are not allowed to cancel this request");
  }

  if (!["PENDING", "APPROVED"].includes(request.status)) {
    throw new ApiError(
      400,
      `Cannot cancel a request with status ${request.status}`
    );
  }

  request.status = "CANCELLED";

  await request.save();

  return request;
};

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