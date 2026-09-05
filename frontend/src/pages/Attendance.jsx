import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
} from "../api/attendanceApi";

import { getEmployees } from "../api/employeeApi";

export default function Attendance() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  const [todayAttendance, setTodayAttendance] =
    useState(null);

  // =========================================================
  // FETCH ATTENDANCE
  // =========================================================

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAttendance();

      console.log(
        "ATTENDANCE API RESPONSE:",
        response.data
      );

      const data = response.data?.data;

      const attendanceList = Array.isArray(data)
        ? data
        : data?.attendance || [];

      console.log(
        "ATTENDANCE LIST:",
        attendanceList
      );

      setAttendance(attendanceList);
    } catch (error) {
      console.error(
        "ATTENDANCE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH EMPLOYEES
  // =========================================================

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();

      console.log(
        "EMPLOYEES FOR ATTENDANCE:",
        response.data
      );

      const data = response.data?.data;

      const employeeList = Array.isArray(data)
        ? data
        : data?.employees || [];

      setEmployees(employeeList);

      // Select first active employee for demo widget
      if (!selectedEmployee) {
        const activeEmployee =
          employeeList.find(
            (employee) =>
              employee.employmentStatus ===
              "ACTIVE"
          ) || employeeList[0];

        if (activeEmployee) {
          setSelectedEmployee(
            activeEmployee._id
          );
        }
      }
    } catch (error) {
      console.error(
        "EMPLOYEES ERROR:",
        error
      );

      setActionError(
        error.response?.data?.message ||
          "Failed to load employees."
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  // =========================================================
  // GET SELECTED EMPLOYEE
  // =========================================================

  const selectedEmployeeData =
    employees.find(
      (employee) =>
        employee._id === selectedEmployee
    );

  // =========================================================
  // GET TODAY'S ATTENDANCE
  // =========================================================

  useEffect(() => {
    if (!selectedEmployee) {
      setTodayAttendance(null);
      return;
    }

    const today = new Date();

    const todayString =
      today.toISOString().split("T")[0];

    const record = attendance.find((item) => {
      if (!item.date) return false;

      const recordDate = new Date(item.date)
        .toISOString()
        .split("T")[0];

      const employeeId =
        typeof item.employee === "object"
          ? item.employee?._id
          : item.employee;

      return (
        employeeId === selectedEmployee &&
        recordDate === todayString
      );
    });

    setTodayAttendance(record || null);
  }, [
    attendance,
    selectedEmployee,
  ]);

  // =========================================================
  // FORMAT DATE / TIME
  // =========================================================

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // FORMAT WORKED HOURS
  // =========================================================

  const formatWorkedHours = (hours) => {
    if (
      hours === undefined ||
      hours === null
    ) {
      return "-";
    }

    return `${Number(hours).toFixed(2)} hrs`;
  };

  // =========================================================
  // CHECK IN
  // =========================================================

  const handleCheckIn = async () => {
    if (!selectedEmployee) {
      setActionError(
        "Please select an employee."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const now = new Date();

      const attendanceData = {
        employee: selectedEmployee,
        date: now.toISOString(),
        checkIn: now.toISOString(),
      };

      console.log(
        "CHECK IN DATA:",
        attendanceData
      );

      const response =
        await createAttendance(
          attendanceData
        );

      console.log(
        "CHECK IN RESPONSE:",
        response.data
      );

      await fetchAttendance();
    } catch (error) {
      console.error(
        "CHECK IN ERROR:",
        error
      );

      setActionError(
        error.response?.data?.message ||
          "Failed to check in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // CHECK OUT
  // =========================================================

  const handleCheckOut = async () => {
    if (!todayAttendance?._id) {
      setActionError(
        "No active attendance record found for today."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const now = new Date();

      const response =
        await updateAttendance(
          todayAttendance._id,
          {
            checkOut: now.toISOString(),
          }
        );

      console.log(
        "CHECK OUT RESPONSE:",
        response.data
      );

      await fetchAttendance();
    } catch (error) {
      console.error(
        "CHECK OUT ERROR:",
        error
      );

      setActionError(
        error.response?.data?.message ||
          "Failed to check out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================================================
  // FILTER ATTENDANCE
  // =========================================================

  const rows = attendance
    .map((item) => {
      const employee =
        typeof item.employee === "object"
          ? item.employee
          : null;

      return {
        ...item,

        id: item._id,

        employeeName: employee
          ? `${employee.firstName || ""} ${
              employee.lastName || ""
            }`.trim()
          : "-",

        checkIn: formatTime(
          item.checkIn
        ),

        checkOut: formatTime(
          item.checkOut
        ),

        worked:
          formatWorkedHours(
            item.workedHours
          ),

        status:
          item.status || "PRESENT",
      };
    })
    .filter((item) =>
      item.employeeName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      key: "employeeName",
      label: "Employee",
    },

    {
      key: "checkIn",
      label: "Check In",
    },

    {
      key: "checkOut",
      label: "Check Out",
    },

    {
      key: "worked",
      label: "Worked Hours",
    },

    {
      key: "status",
      label: "Status",

      render: (row) => (
        <StatusBadge
          status={row.status}
        />
      ),
    },
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <Layout>
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="page-header">
        <div>
          <div className="page-title">
            Attendance
          </div>

          <div className="page-subtitle">
            Search all employee attendance
            records
          </div>
        </div>

        <input
          className="search-input"
          placeholder="Search attendance..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div
          className="card"
          style={{
            marginBottom: 16,
          }}
        >
          <div className="login-error">
            {error}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MAIN GRID */}
      {/* ================================================= */}

      <div
        className="grid-2"
        style={{
          gridTemplateColumns:
            "1fr 280px",
        }}
      >
        {/* ============================================= */}
        {/* ATTENDANCE TABLE */}
        {/* ============================================= */}

        <div className="card">
          {loading ? (
            <div>
              Loading attendance...
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={rows}
              onRowClick={(row) =>
                navigate(
                  `/attendance/${row.id}`
                )
              }
            />
          )}
        </div>

        {/* ============================================= */}
        {/* ATTENDANCE WIDGET */}
        {/* ============================================= */}

        <div className="card">
          <div className="section-title">
            Attendance Widget
          </div>

          {/* Employee selector */}

          <div
            className="field"
            style={{
              marginBottom: 14,
            }}
          >
            <label>
              Employee
            </label>

            <select
              value={
                selectedEmployee
              }
              onChange={(e) => {
                setSelectedEmployee(
                  e.target.value
                );

                setActionError("");
              }}
            >
              <option value="">
                Select employee
              </option>

              {employees.map(
                (employee) => (
                  <option
                    key={
                      employee._id
                    }
                    value={
                      employee._id
                    }
                  >
                    {
                      employee.firstName
                    }{" "}
                    {
                      employee.lastName
                    }{" "}
                    (
                    {
                      employee.employeeCode
                    }
                    )
                  </option>
                )
              )}
            </select>
          </div>

          <p
            style={{
              margin: "0 0 4px",
              fontSize: 13,
            }}
          >
            Welcome back,
          </p>

          <p
            style={{
              margin: "0 0 14px",
              fontWeight: 600,
            }}
          >
            {selectedEmployeeData
              ? `${selectedEmployeeData.firstName} ${selectedEmployeeData.lastName}`
              : "-"}
          </p>

          <p
            style={{
              color:
                "var(--text-dim)",
              fontSize: 12.5,
            }}
          >
            Today
          </p>

          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              margin:
                "4px 0 16px",
            }}
          >
            {todayAttendance?.checkIn &&
            !todayAttendance?.checkOut
              ? "In progress"
              : todayAttendance?.checkOut
              ? "Completed"
              : "Not checked in"}
          </p>

          {/* ========================================= */}
          {/* ACTION BUTTON */}
          {/* ========================================= */}

          {!todayAttendance?.checkIn ||
          todayAttendance?.checkOut ? (
            <button
              className="btn btn-primary"
              style={{
                width: "100%",
              }}
              onClick={
                handleCheckIn
              }
              disabled={
                actionLoading ||
                !selectedEmployee
              }
            >
              {actionLoading
                ? "Processing..."
                : "Check In"}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              style={{
                width: "100%",
              }}
              onClick={
                handleCheckOut
              }
              disabled={
                actionLoading
              }
            >
              {actionLoading
                ? "Processing..."
                : "Check Out"}
            </button>
          )}

          {/* ========================================= */}
          {/* ACTION ERROR */}
          {/* ========================================= */}

          {actionError && (
            <div
              className="login-error"
              style={{
                marginTop: 12,
              }}
            >
              {actionError}
            </div>
          )}

          {/* ========================================= */}
          {/* TODAY INFO */}
          {/* ========================================= */}

          {todayAttendance && (
            <div
              style={{
                marginTop: 18,
                fontSize: 13,
              }}
            >
              <div>
                <strong>
                  Check In:
                </strong>{" "}
                {formatTime(
                  todayAttendance.checkIn
                )}
              </div>

              <div
                style={{
                  marginTop: 6,
                }}
              >
                <strong>
                  Check Out:
                </strong>{" "}
                {formatTime(
                  todayAttendance.checkOut
                )}
              </div>

              <div
                style={{
                  marginTop: 6,
                }}
              >
                <strong>
                  Worked:
                </strong>{" "}
                {formatWorkedHours(
                  todayAttendance.workedHours
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}