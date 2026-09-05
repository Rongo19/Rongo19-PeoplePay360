import api from "./api";

// ==========================================
// Get Attendance Records
// ==========================================

export const getAttendance = async (params = {}) => {
  return api.get("/attendance", {
    params,
  });
};

// ==========================================
// Get Single Attendance Record
// ==========================================

export const getAttendanceRecord = async (id) => {
  return api.get(`/attendance/${id}`);
};

// ==========================================
// Create Attendance
// ==========================================

export const createAttendance = async (attendanceData) => {
  return api.post("/attendance", attendanceData);
};

// ==========================================
// Update Attendance
// ==========================================

export const updateAttendance = async (
  id,
  attendanceData
) => {
  return api.patch(
    `/attendance/${id}`,
    attendanceData
  );
};