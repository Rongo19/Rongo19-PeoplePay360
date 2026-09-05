import api from "./api";

export const getContracts = async (params = {}) => {
  return api.get("/contracts", { params });
};

export const getContract = async (id) => {
  return api.get(`/contracts/${id}`);
};

export const createContract = async (contractData) => {
  return api.post("/contracts", contractData);
};

export const updateContract = async (id, contractData) => {
  return api.patch(`/contracts/${id}`, contractData);
};

export const activateContract = async (id) => {
  return api.patch(`/contracts/${id}/activate`);
};

export const terminateContract = async (id) => {
  return api.patch(`/contracts/${id}/terminate`);
};