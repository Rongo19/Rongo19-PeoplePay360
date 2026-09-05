import api from "./api";

export const getEmployees = async (params = {}) => {
  return api.get("/employees", { params });
};

export const getEmployee = async (id) => {
  return api.get(`/employees/${id}`);
};

export const createEmployee = async (employeeData) => {
  return api.post("/employees", employeeData);
};

export const updateEmployee = async (id, employeeData) => {
  return api.patch(`/employees/${id}`, employeeData);
};

export const deactivateEmployee = async (id) => {
  return api.patch(`/employees/${id}/deactivate`);
};
