import api from "./api";

export const getPayslips = async (params = {}) => {
  return api.get("/payslips", {
    params,
  });
};

export const getPayslip = async (id) => {
  return api.get(`/payslips/${id}`);
};

export const downloadPayslipPDF = async (id) => {
  return api.get(`/payslips/${id}/pdf`, {
    responseType: "blob",
  });
};

export const sendPayslipEmail = async (id) => {
  return api.post(`/payslips/${id}/send-email`);
};