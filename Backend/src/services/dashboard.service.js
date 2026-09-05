const Employee = require("../models/Employee");
const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const TimeOffRequest = require("../models/TimeOffRequest");
const Attendance = require("../models/Attendance");

// ======================================================
// HELPERS
// ======================================================

const getMonthRange = (month) => {
  if (!month) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})$/.exec(month);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);

  if (
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return null;
  }

  const start = new Date(
    Date.UTC(year, monthNumber - 1, 1)
  );

  const end = new Date(
    Date.UTC(year, monthNumber, 1)
  );

  return {
    start,
    end,
    year,
    month: monthNumber,
  };
};

const getDepartmentFilter = (department) => {
  if (
    !department ||
    department === "All Departments"
  ) {
    return {};
  }

  return {
    department,
  };
};

// ======================================================
// EMPLOYEE SUMMARY
// ======================================================

const getEmployeeSummary = async ({
  department,
} = {}) => {
  const departmentFilter =
    getDepartmentFilter(department);

  const [
    totalEmployees,
    activeEmployees,
    onLeaveEmployees,
    resignedEmployees,
    terminatedEmployees,
  ] = await Promise.all([
    Employee.countDocuments(
      departmentFilter
    ),

    Employee.countDocuments({
      ...departmentFilter,
      employmentStatus: "ACTIVE",
    }),

    Employee.countDocuments({
      ...departmentFilter,
      employmentStatus: "ON_LEAVE",
    }),

    Employee.countDocuments({
      ...departmentFilter,
      employmentStatus: "RESIGNED",
    }),

    Employee.countDocuments({
      ...departmentFilter,
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

// ======================================================
// PAYROLL SUMMARY
// ======================================================

const getPayrollSummary = async ({
  month,
  department,
} = {}) => {
  const monthRange = getMonthRange(month);

  const payrunFilter = {
    status: {
      $in: [
        "COMPUTED",
        "VALIDATED",
        "PAID",
      ],
    },
  };

  if (monthRange) {
    payrunFilter.periodStart = {
      $gte: monthRange.start,
    };

    payrunFilter.periodEnd = {
      $lt: monthRange.end,
    };
  }

  const latestPayrun =
    await Payrun.findOne(
      payrunFilter
    )
      .sort({
        periodEnd: -1,
        createdAt: -1,
      })
      .select(
        "name periodStart periodEnd payDate status totalEmployees totalGross totalDeductions totalNet warnings"
      );

  // --------------------------------------------------
  // PAYSLIP FILTER
  // --------------------------------------------------

  const payslipMatch = {
    status: {
      $in: [
        "FINAL",
        "PAID",
      ],
    },
  };

  if (monthRange) {
    payslipMatch.periodStart = {
      $gte: monthRange.start,
    };

    payslipMatch.periodEnd = {
      $lt: monthRange.end,
    };
  }

  // --------------------------------------------------
  // DEPARTMENT FILTER
  // --------------------------------------------------

  const departmentLookup = [];

  if (
    department &&
    department !== "All Departments"
  ) {
    departmentLookup.push({
      $match: {
        "employee.department":
          department,
      },
    });
  }

  // --------------------------------------------------
  // PAYROLL TOTALS
  // --------------------------------------------------

  const payrollTotals =
    await Payslip.aggregate([
      {
        $match: payslipMatch,
      },

      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },

      {
        $unwind: "$employee",
      },

      ...departmentLookup,

      {
        $group: {
          _id: null,

          totalGross: {
            $sum: "$grossSalary",
          },

          totalDeductions: {
            $sum: "$totalDeductions",
          },

          totalNet: {
            $sum: "$netSalary",
          },

          employeesPaid: {
            $addToSet: "$employee._id",
          },
        },
      },

      {
        $project: {
          _id: 0,

          totalGross: 1,
          totalDeductions: 1,
          totalNet: 1,

          employeesPaid: {
            $size: "$employeesPaid",
          },
        },
      },
    ]);

  const totals =
    payrollTotals[0] || {
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      employeesPaid: 0,
    };

  // --------------------------------------------------
  // SALARY BY DEPARTMENT
  // --------------------------------------------------

  const salaryByDepartment =
    await Payslip.aggregate([
      {
        $match: payslipMatch,
      },

      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },

      {
        $unwind: "$employee",
      },

      ...departmentLookup,

      {
        $group: {
          _id: "$employee.department",

          value: {
            $sum: "$netSalary",
          },
        },
      },

      {
        $project: {
          _id: 0,
          dept: "$_id",
          value: 1,
        },
      },

      {
        $sort: {
          value: -1,
        },
      },
    ]);

  // --------------------------------------------------
  // PAYSLIP STATUS
  // --------------------------------------------------

  const payslipStatus =
    await Payslip.aggregate([
      {
        $match: {
          ...(monthRange
            ? {
                periodStart: {
                  $gte: monthRange.start,
                },
                periodEnd: {
                  $lt: monthRange.end,
                },
              }
            : {}),
        },
      },

      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },

      {
        $unwind: "$employee",
      },

      ...departmentLookup,

      {
        $group: {
          _id: "$status",
          value: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,
          label: "$_id",
          value: 1,
        },
      },
    ]);

  return {
    latestPayrun,

    totals,

    salaryByDepartment,

    payslipStatus,
  };
};

// ======================================================
// RECENT PAYSLIPS
// ======================================================

const getRecentPayslips = async (
  limit = 10,
  {
    month,
    department,
  } = {}
) => {
  const monthRange =
    getMonthRange(month);

  const filter = {};

  if (monthRange) {
    filter.periodStart = {
      $gte: monthRange.start,
    };

    filter.periodEnd = {
      $lt: monthRange.end,
    };
  }

  let query =
    Payslip.find(filter)
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

  const payslips = await query;

  if (
    department &&
    department !== "All Departments"
  ) {
    return payslips.filter(
      (payslip) =>
        payslip.employee?.department ===
        department
    );
  }

  return payslips;
};

// ======================================================
// LEAVE SUMMARY
// ======================================================

const getLeaveSummary = async ({
  month,
  department,
} = {}) => {
  const monthRange =
    getMonthRange(month);

  const match = {};

  if (monthRange) {
    match.startDate = {
      $lt: monthRange.end,
    };

    match.endDate = {
      $gte: monthRange.start,
    };
  }

  const pipeline = [
    {
      $match: match,
    },

    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },

    {
      $unwind: "$employee",
    },
  ];

  if (
    department &&
    department !== "All Departments"
  ) {
    pipeline.push({
      $match: {
        "employee.department":
          department,
      },
    });
  }

  pipeline.push({
    $group: {
      _id: "$status",
      value: {
        $sum: 1,
      },
    },
  });

  const result =
    await TimeOffRequest.aggregate(
      pipeline
    );

  const summary = {
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    cancelledRequests: 0,
  };

  result.forEach((item) => {
    if (item._id === "PENDING") {
      summary.pendingRequests =
        item.value;
    }

    if (item._id === "APPROVED") {
      summary.approvedRequests =
        item.value;
    }

    if (item._id === "REJECTED") {
      summary.rejectedRequests =
        item.value;
    }

    if (item._id === "CANCELLED") {
      summary.cancelledRequests =
        item.value;
    }
  });

  return summary;
};

// ======================================================
// ATTENDANCE OVERVIEW
// ======================================================

const getAttendanceOverview = async ({
  month,
  department,
} = {}) => {
  const monthRange =
    getMonthRange(month);

  const match = {};

  if (monthRange) {
    match.date = {
      $gte: monthRange.start,
      $lt: monthRange.end,
    };
  }

  const pipeline = [
    {
      $match: match,
    },

    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },

    {
      $unwind: "$employee",
    },
  ];

  if (
    department &&
    department !== "All Departments"
  ) {
    pipeline.push({
      $match: {
        "employee.department":
          department,
      },
    });
  }

  pipeline.push({
    $group: {
      _id: "$status",
      value: {
        $sum: 1,
      },
    },
  });

  const result =
    await Attendance.aggregate(
      pipeline
    );

  const overview = {
    present: 0,
    late: 0,
    absent: 0,
    halfDay: 0,
    onLeave: 0,
  };

  result.forEach((item) => {
    switch (item._id) {
      case "PRESENT":
        overview.present += item.value;
        break;

      case "ABSENT":
        overview.absent += item.value;
        break;

      case "HALF_DAY":
        overview.halfDay += item.value;
        break;

      case "ON_LEAVE":
        overview.onLeave += item.value;
        break;
    }
  });

  return overview;
};

// ======================================================
// DEPARTMENT OVERVIEW
// ======================================================

const getDepartmentOverview = async ({
  department,
} = {}) => {
  const match = {
    employmentStatus: {
      $in: [
        "ACTIVE",
        "ON_LEAVE",
      ],
    },
  };

  if (
    department &&
    department !== "All Departments"
  ) {
    match.department =
      department;
  }

  return Employee.aggregate([
    {
      $match: match,
    },

    {
      $group: {
        _id: "$department",

        headcount: {
          $sum: 1,
        },
      },
    },

    {
      $project: {
        _id: 0,
        dept: "$_id",
        headcount: 1,
      },
    },

    {
      $sort: {
        headcount: -1,
      },
    },
  ]);
};

// ======================================================
// MONTHLY NET SALARY TREND
// ======================================================

const getNetSalaryTrend = async ({
  month,
  department,
} = {}) => {
  const selectedMonth =
    getMonthRange(month);

  if (!selectedMonth) {
    return [];
  }

  // Show the selected month and
  // previous 5 months.
  const startDate =
    new Date(
      Date.UTC(
        selectedMonth.year,
        selectedMonth.month - 7,
        1
      )
    );

  const endDate =
    selectedMonth.end;

  
  // Instead of using Payrun totals
  // (which can't be department filtered),
  // calculate directly from payslips.
  const payslipPipeline = [
    {
      $match: {
        periodStart: {
          $gte: startDate,
          $lt: endDate,
        },
        periodEnd: {
          $lt: endDate,
        },
        status: {
          $in: [
            "FINAL",
            "PAID",
          ],
        },
      },
    },

    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    },

    {
      $unwind: "$employee",
    },
  ];

  if (
    department &&
    department !== "All Departments"
  ) {
    payslipPipeline.push({
      $match: {
        "employee.department":
          department,
      },
    });
  }

  payslipPipeline.push(
    {
      $group: {
        _id: "$periodStart",
        value: {
          $sum: "$netSalary",
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    }
  );

  const result =
    await Payslip.aggregate(
      payslipPipeline
    );

  return result.map((item) => {
    const date =
      new Date(item._id);

    return {
      month: date.toLocaleString(
        "en-US",
        {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }
      ),
      value: item.value,
    };
  });
};

// ======================================================
// OVERVIEW
// ======================================================

const getOverview = async ({
  month,
  department,
} = {}) => {
  const [
    employees,
    payroll,
    leave,
    attendance,
    departmentOverview,
    netSalaryTrend,
    recentPayslips,
  ] = await Promise.all([
    getEmployeeSummary({
      department,
    }),

    getPayrollSummary({
      month,
      department,
    }),

    getLeaveSummary({
      month,
      department,
    }),

    getAttendanceOverview({
      month,
      department,
    }),

    getDepartmentOverview({
      department,
    }),

    getNetSalaryTrend({
      month,
      department,
    }),

    getRecentPayslips(
      5,
      {
        month,
        department,
      }
    ),
  ]);

  return {
    filters: {
      month: month || null,
      department:
        department || "All Departments",
    },

    employees,

    payroll,

    leave,

    attendance,

    departmentOverview,

    netSalaryTrend,

    recentPayslips,
  };
};

// ======================================================

module.exports = {
  getEmployeeSummary,
  getPayrollSummary,
  getRecentPayslips,
  getLeaveSummary,
  getAttendanceOverview,
  getDepartmentOverview,
  getNetSalaryTrend,
  getOverview,
};