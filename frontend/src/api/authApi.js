import api from "./api";

export const login = async (credentials) => {
  return api.post("/auth/login", credentials);
};

export const getCurrentUser = async () => {
  return api.get("/auth/me");
};