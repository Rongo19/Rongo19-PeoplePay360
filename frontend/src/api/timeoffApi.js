import api from "./api";

// ==========================================
// TIME OFF TYPES
// ==========================================

export const getTimeOffTypes = async (params = {}) => {
  return api.get("/timeoff/types", {
    params,
  });
};

export const createTimeOffType = async (data) => {
  return api.post("/timeoff/types", data);
};

export const updateTimeOffType = async (id, data) => {
  return api.patch(`/timeoff/types/${id}`, data);
};

// ==========================================
// ALLOCATIONS
// ==========================================

export const getAllocations = async (params = {}) => {
  return api.get("/timeoff/allocations", {
    params,
  });
};

export const createAllocation = async (data) => {
  return api.post("/timeoff/allocations", data);
};

export const getEmployeeBalance = async (
  employeeId,
  year
) => {
  return api.get(`/timeoff/balance/${employeeId}`, {
    params: year ? { year } : {},
  });
};

// ==========================================
// TIME OFF REQUESTS
// ==========================================

export const getTimeOffRequests = async (params = {}) => {
  return api.get("/timeoff/requests", {
    params,
  });
};

export const getTimeOffRequest = async (id) => {
  return api.get(`/timeoff/requests/${id}`);
};

export const createTimeOffRequest = async (data) => {
  return api.post("/timeoff/requests", data);
};

export const approveTimeOffRequest = async (id) => {
  return api.patch(`/timeoff/requests/${id}/approve`);
};

export const rejectTimeOffRequest = async (
  id,
  rejectionReason
) => {
  return api.patch(
    `/timeoff/requests/${id}/reject`,
    {
      rejectionReason,
    }
  );
};

export const cancelTimeOffRequest = async (id) => {
  return api.patch(`/timeoff/requests/${id}/cancel`);
};