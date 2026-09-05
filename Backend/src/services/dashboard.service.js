const Employee = require("../models/Employee");
const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const TimeOffRequest = require("../models/TimeOffRequest");

const getEmployeeSummary = async () => {
  const [
    totalEmployees,
    activeEmployees,
    onLeaveEmployees,
    resignedEmployees,
    terminatedEmployees,
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({
      employmentStatus: "ACTIVE",
    }),
    Employee.countDocuments({
      employmentStatus: "ON_LEAVE",
    }),
    Employee.countDocuments({
      employmentStatus: "RESIGNED",
    }),
    Employee.countDocuments({
      employmentStatus: "TERMINATED",
    }),
  ]);

  return {
    totalEmployees,
    activeEmployees,
    onLeaveEmployees,
    resignedEmployees,
    terminatedEmployees,
  };
};

const getPayrollSummary = async () => {
  const [latestPayrun, payrollTotals] = await Promise.all([
    Payrun.findOne()
      .sort({ periodEnd: -1, createdAt: -1 })
      .select(
        "name periodStart periodEnd payDate status totalEmployees totalGross totalDeductions totalNet warnings"
      ),

    Payrun.aggregate([
      {
        $match: {
          status: {
            $in: ["COMPUTED", "VALIDATED", "PAID"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalGross: { $sum: "$totalGross" },
          totalDeductions: {
            $sum: "$totalDeductions",
          },
          totalNet: { $sum: "$totalNet" },
          totalEmployeesProcessed: {
            $sum: "$totalEmployees",
          },
          payrunsProcessed: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  return {
    latestPayrun,
    totals: payrollTotals[0] || {
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalEmployeesProcessed: 0,
      payrunsProcessed: 0,
    },
  };
};

const getRecentPayslips = async (limit = 10) => {
  const payslips = await Payslip.find()
    .populate(
      "employee",
      "employeeCode firstName lastName email department designation"
    )
    .populate(
      "payrun",
      "name periodStart periodEnd payDate status"
    )
    .sort({
      createdAt: -1,
    })
    .limit(limit);

  return payslips;
};

const getLeaveSummary = async () => {
  const [
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    cancelledRequests,
  ] = await Promise.all([
    TimeOffRequest.countDocuments({
      status: "PENDING",
    }),
    TimeOffRequest.countDocuments({
      status: "APPROVED",
    }),
    TimeOffRequest.countDocuments({
      status: "REJECTED",
    }),
    TimeOffRequest.countDocuments({
      status: "CANCELLED",
    }),
  ]);

  return {
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    cancelledRequests,
  };
};

const getOverview = async () => {
  const [
    employeeSummary,
    payrollSummary,
    leaveSummary,
    recentPayslips,
  ] = await Promise.all([
    getEmployeeSummary(),
    getPayrollSummary(),
    getLeaveSummary(),
    getRecentPayslips(5),
  ]);

  return {
    employees: employeeSummary,
    payroll: payrollSummary,
    leave: leaveSummary,
    recentPayslips,
  };
};

module.exports = {
  getEmployeeSummary,
  getPayrollSummary,
  getRecentPayslips,
  getLeaveSummary,
  getOverview,
};