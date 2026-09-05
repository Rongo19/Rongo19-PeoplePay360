import api from "./api";

// ================================
// Working Schedules
// ================================

export const getSchedules = async (params = {}) => {
  return api.get("/schedules", {
    params,
  });
};

export const getSchedule = async (id) => {
  return api.get(`/schedules/${id}`);
};

export const createSchedule = async (data) => {
  return api.post("/schedules", data);
};

export const updateSchedule = async (id, data) => {
  return api.patch(`/schedules/${id}`, data);
};

export const deactivateSchedule = async (id) => {
  return api.patch(`/schedules/${id}/deactivate`);
};