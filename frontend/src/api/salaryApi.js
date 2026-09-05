import api from "./api";

// ================================
// Salary Structures
// ================================

export const getStructures = async (params = {}) => {
  return api.get("/salary/structures", {
    params,
  });
};

export const getStructure = async (id) => {
  return api.get(`/salary/structures/${id}`);
};

export const createStructure = async (data) => {
  return api.post("/salary/structures", data);
};

export const updateStructure = async (id, data) => {
  return api.patch(`/salary/structures/${id}`, data);
};

// ================================
// Salary Rules
// ================================

export const getRules = async (params = {}) => {
  return api.get("/salary/rules", {
    params,
  });
};

export const getRule = async (id) => {
  return api.get(`/salary/rules/${id}`);
};

export const createRule = async (data) => {
  return api.post("/salary/rules", data);
};

export const updateRule = async (id, data) => {
  return api.patch(`/salary/rules/${id}`, data);
};