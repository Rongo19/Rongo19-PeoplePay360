import api from "./api";

export const getDashboardOverview = async (
  params = {}
) => {
  return api.get("/dashboard/overview", {
    params,
  });
};

export const getEmployeeSummary = async (
  params = {}
) => {
  return api.get(
    "/dashboard/employee-summary",
    { params }
  );
};

export const getPayrollSummary = async (
  params = {}
) => {
  return api.get(
    "/dashboard/payroll-summary",
    { params }
  );
};

export const getRecentPayslips = async (
  params = {}
) => {
  return api.get(
    "/dashboard/recent-payslips",
    { params }
  );
};

export const getLeaveSummary = async (
  params = {}
) => {
  return api.get(
    "/dashboard/leave-summary",
    { params }
  );
};