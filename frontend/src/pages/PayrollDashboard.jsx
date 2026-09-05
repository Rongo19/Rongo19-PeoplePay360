import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { getDashboardOverview } from "../api/dashboardApi";

const getCurrentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
};

const formatCurrency = (value = 0) =>
  `₹ ${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatMonthLabel = (month) => {
  if (!month) return "";

  const [year, monthNumber] =
    month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export default function PayrollDashboard() {
  const [month, setMonth] =
    useState(getCurrentMonth());

  const [department, setDepartment] =
    useState("All Departments");

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==================================================
  // FETCH DASHBOARD
  // ==================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDashboardOverview({
          month,
          department,
        });

      setDashboard(response.data.data);
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [month, department]);

  // ==================================================
  // DATA
  // ==================================================

  const employees =
    dashboard?.employees || {};

  const payroll =
    dashboard?.payroll || {};

  const totals =
    payroll.totals || {};

  const attendance =
    dashboard?.attendance || {};

  const leave =
    dashboard?.leave || {};

  const salaryByDepartment =
    dashboard?.salaryByDepartment ||
    payroll.salaryByDepartment ||
    [];

  const departmentOverview =
    dashboard?.departmentOverview || [];

  const netSalaryTrend =
    dashboard?.netSalaryTrend || [];

  // ==================================================
  // DERIVED VALUES
  // ==================================================

  const avgSalary =
    totals.employeesPaid > 0
      ? totals.totalNet /
        totals.employeesPaid
      : 0;

  const attendanceTotal =
    (attendance.present || 0) +
    (attendance.absent || 0) +
    (attendance.halfDay || 0) +
    (attendance.onLeave || 0);

  const attendanceHealth =
    attendanceTotal > 0
      ? `${Math.round(
          ((attendance.present || 0) /
            attendanceTotal) *
            100
        )}%`
      : "0%";

  const totalPayslipStatuses =
    (payroll.payslipStatus || []).reduce(
      (sum, item) =>
        sum + Number(item.value || 0),
      0
    );

  const maxDepartmentSalary =
    Math.max(
      ...salaryByDepartment.map(
        (item) =>
          Number(item.value || 0)
      ),
      1
    );

  const maxTrend =
    Math.max(
      ...netSalaryTrend.map(
        (item) =>
          Number(item.value || 0)
      ),
      1
    );

  const maxHeadcount =
    Math.max(
      ...departmentOverview.map(
        (item) =>
          Number(
            item.headcount || 0
          )
      ),
      1
    );

  // ==================================================
  // LOADING
  // ==================================================

  if (loading && !dashboard) {
    return (
      <Layout>
        <div className="empty-state">
          Loading payroll dashboard...
        </div>
      </Layout>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error && !dashboard) {
    return (
      <Layout>
        <div className="empty-state">
          {error}
        </div>
      </Layout>
    );
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">
            Payroll Dashboard
          </div>

          <div className="page-subtitle">
            Live payroll insights from your
            HR and Payroll data
          </div>
        </div>

        <div className="toolbar">
          {/* MONTH */}
          <select
            className="search-input"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
          >
            <option value="2026-09">
              September 2026
            </option>

            <option value="2026-08">
              August 2026
            </option>

            <option value="2026-07">
              July 2026
            </option>

            <option value="2026-06">
              June 2026
            </option>
          </select>

          {/* DEPARTMENT */}
          <select
            className="search-input"
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
          >
            <option>
              All Departments
            </option>

            {departmentOverview.map(
              (item) => (
                <option
                  key={item.dept}
                  value={item.dept}
                >
                  {item.dept}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="card"
          style={{
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* ==============================================
          STAT CARDS
      ============================================== */}

      <div
        className="grid-4"
        style={{
          marginBottom: 16,
        }}
      >
        <div className="stat-card">
          <div className="label">
            Total Salary Paid
          </div>

          <div className="value">
            {formatCurrency(
              totals.totalNet
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="label">
            Employees Paid
          </div>

          <div className="value">
            {totals.employeesPaid || 0}
          </div>
        </div>

        <div className="stat-card">
          <div className="label">
            Avg Salary / Employee
          </div>

          <div className="value">
            {formatCurrency(avgSalary)}
          </div>
        </div>

        <div className="stat-card">
          <div className="label">
            Attendance Health
          </div>

          <div className="value">
            {attendanceHealth}
          </div>
        </div>
      </div>

      {/* ==============================================
          SALARY CHARTS
      ============================================== */}

      <div
        className="grid-2"
        style={{
          marginBottom: 16,
        }}
      >
        {/* SALARY BY DEPARTMENT */}

        <div className="card">
          <div className="section-title">
            Salary Cost by Department
          </div>

          {salaryByDepartment.length === 0 ? (
            <div className="empty-state">
              No payroll data for this
              selection.
            </div>
          ) : (
            <div className="bar-chart">
              {salaryByDepartment.map(
                (item) => (
                  <div
                    className="bar-col"
                    key={item.dept}
                  >
                    <div
                      className="bar"
                      style={{
                        height: `${
                          (item.value /
                            maxDepartmentSalary) *
                          100
                        }%`,
                      }}
                      title={`${item.dept}: ${formatCurrency(
                        item.value
                      )}`}
                    />

                    <div className="bar-label">
                      {item.dept}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* NET SALARY TREND */}

        <div className="card">
          <div className="section-title">
            Net Salary Trend
          </div>

          {netSalaryTrend.length ===
          0 ? (
            <div className="empty-state">
              No historical payroll data.
            </div>
          ) : (
            <div className="bar-chart">
              {netSalaryTrend.map(
                (item) => (
                  <div
                    className="bar-col"
                    key={item.month}
                  >
                    <div
                      className="bar"
                      style={{
                        height: `${
                          (item.value /
                            maxTrend) *
                          100
                        }%`,
                      }}
                      title={`${item.month}: ${formatCurrency(
                        item.value
                      )}`}
                    />

                    <div className="bar-label">
                      {item.month}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==============================================
          STATUS / ATTENDANCE / LEAVE
      ============================================== */}

      <div
        className="grid-3"
        style={{
          marginBottom: 16,
        }}
      >
        {/* PAYSLIP STATUS */}

        <div className="card">
          <div className="section-title">
            Payslip Status & Alerts
          </div>

          {(payroll.payslipStatus || [])
            .length === 0 ? (
            <div className="empty-state">
              No payslips found.
            </div>
          ) : (
            payroll.payslipStatus.map(
              (item) => (
                <div
                  key={item.label}
                  className="legend-row"
                >
                  <span className="legend-dot" />

                  <span
                    style={{
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      color:
                        "var(--text-dim)",
                    }}
                  >
                    {item.value} (
                    {totalPayslipStatuses
                      ? Math.round(
                          (item.value /
                            totalPayslipStatuses) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
              )
            )
          )}
        </div>

        {/* ATTENDANCE */}

        <div className="card">
          <div className="section-title">
            Attendance Overview
          </div>

          <div className="legend-row">
            <span className="legend-dot" />

            <span
              style={{
                flex: 1,
              }}
            >
              Present
            </span>

            <span>
              {attendance.present || 0}
            </span>
          </div>

          <div className="legend-row">
            <span className="legend-dot" />

            <span
              style={{
                flex: 1,
              }}
            >
              Half Day
            </span>

            <span>
              {attendance.halfDay || 0}
            </span>
          </div>

          <div className="legend-row">
            <span className="legend-dot" />

            <span
              style={{
                flex: 1,
              }}
            >
              Absent
            </span>

            <span>
              {attendance.absent || 0}
            </span>
          </div>

          <div className="legend-row">
            <span className="legend-dot" />

            <span
              style={{
                flex: 1,
              }}
            >
              On Leave
            </span>

            <span>
              {attendance.onLeave || 0}
            </span>
          </div>
        </div>

        {/* TIME OFF */}

        <div className="card">
          <div className="section-title">
            Time Off Overview
          </div>

          <div className="legend-row">
            <span className="legend-dot" />

            <span
              style={{
                flex: 1,
              }}
            >
              Approved
            </span>

            <span>
              {leave.approvedRequests ||
                0}
            </span>
          </div>

          <div className="legend-row">
            <span className="legend-dot" />

            <span
              style={{
                flex: 1,
              }}
            >
              Pending
            </span>

            <span>
              {leave.pendingRequests ||
                0}
            </span>
          </div>

          <div className="legend-row">
            <span className="legend-dot" />

            <span
              style={{
                flex: 1,
              }}
            >
              Rejected
            </span>

            <span>
              {leave.rejectedRequests ||
                0}
            </span>
          </div>
        </div>
      </div>

      {/* ==============================================
          DEPARTMENT OVERVIEW
      ============================================== */}

      <div className="card">
        <div className="section-title">
          Department Overview
        </div>

        {departmentOverview.length ===
        0 ? (
          <div className="empty-state">
            No employee data found.
          </div>
        ) : (
          <div
            className="bar-chart"
            style={{
              height: 110,
            }}
          >
            {departmentOverview.map(
              (item) => (
                <div
                  className="bar-col"
                  key={item.dept}
                >
                  <div
                    className="bar"
                    style={{
                      height: `${
                        (item.headcount /
                          maxHeadcount) *
                        100
                      }%`,
                    }}
                    title={`${item.dept}: ${item.headcount} employees`}
                  />

                  <div className="bar-label">
                    {item.dept} (
                    {item.headcount})
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}