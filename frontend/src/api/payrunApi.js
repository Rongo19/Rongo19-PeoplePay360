import api from "./api";

// ==========================================
// PAYRUNS
// ==========================================

export const getPayruns = async (params = {}) => {
  return api.get("/payruns", {
    params,
  });
};

export const getPayrun = async (id) => {
  return api.get(`/payruns/${id}`);
};

// ==========================================
// PAYRUN CREATION
// ==========================================

export const previewPayrun = async (data) => {
  return api.post("/payruns/preview", data);
};

export const createPayrun = async (data) => {
  return api.post("/payruns", data);
};

// ==========================================
// PAYRUN PROCESSING
// ==========================================

export const computePayrun = async (id) => {
  return api.post(`/payruns/${id}/compute`);
};

export const validatePayrun = async (id) => {
  return api.post(`/payruns/${id}/validate`);
};

export const markPayrunPaid = async (id) => {
  return api.post(`/payruns/${id}/mark-paid`);
};

export const sendPayrunPayslips = async (id) => {
  return api.post(`/payruns/${id}/send-payslips`);
};