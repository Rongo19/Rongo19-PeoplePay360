import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

import { getAttendanceRecord } from "../api/attendanceApi";

export default function AttendanceDetail() {
  const { id } = useParams();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching attendance record:", id);

        const response = await getAttendanceRecord(id);

        console.log(
          "ATTENDANCE DETAIL API RESPONSE:",
          response.data
        );

        const data = response.data?.data;

        setRecord(data);
      } catch (error) {
        console.error(
          "ATTENDANCE DETAIL ERROR:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load attendance record."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAttendance();
    }
  }, [id]);

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

  if (loading) {
    return (
      <Layout>
        <div className="card">
          Loading attendance record...
        </div>
      </Layout>
    );
  }

  // ---------------------------------------------
  // ERROR
  // ---------------------------------------------

  if (error) {
    return (
      <Layout>
        <Link to="/attendance" className="back-link">
          ← Back to Attendance
        </Link>

        <div className="card">
          <div className="login-error">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  // ---------------------------------------------
  // NOT FOUND
  // ---------------------------------------------

  if (!record) {
    return (
      <Layout>
        <Link to="/attendance" className="back-link">
          ← Back to Attendance
        </Link>

        <div className="empty-state">
          Attendance record not found.
        </div>
      </Layout>
    );
  }

  // ---------------------------------------------
  // EMPLOYEE
  // ---------------------------------------------

  const employee = record.employee;

  const employeeName = employee
    ? `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim()
    : "-";

  const department =
    employee?.department || "-";

  // ---------------------------------------------
  // DATE / TIME VALUES
  // ---------------------------------------------

  const formattedDate = record.date
    ? new Date(record.date).toLocaleDateString()
    : "-";

  const checkIn = record.checkIn
    ? new Date(record.checkIn).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "-";

  const checkOut = record.checkOut
    ? new Date(record.checkOut).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "-";

  // ---------------------------------------------
  // UI
  // ---------------------------------------------

  return (
    <Layout>
      <Link to="/attendance" className="back-link">
        ← Back to Attendance
      </Link>

      <div className="page-header">
        <div>
          <div className="page-title">
            Attendance / {employeeName} /{" "}
            {formattedDate}
          </div>

          <div className="page-subtitle">
            One view of an employee attendance
            record
          </div>
        </div>

        <StatusBadge
          status={record.status || "-"}
        />
      </div>

      {/* --------------------------------------- */}
      {/* ATTENDANCE DETAILS */}
      {/* --------------------------------------- */}

      <div className="card">
        <div className="section-title">
          Attendance Details
        </div>

        <div className="form-grid">

          {/* Employee */}
          <div className="field">
            <label>Employee</label>

            <input
              readOnly
              value={employeeName}
            />
          </div>

          {/* Department */}
          <div className="field">
            <label>Department</label>

            <input
              readOnly
              value={department}
            />
          </div>

          {/* Date */}
          <div className="field">
            <label>Date</label>

            <input
              readOnly
              value={formattedDate}
            />
          </div>

          {/* Status */}
          <div className="field">
            <label>Status</label>

            <input
              readOnly
              value={record.status || "-"}
            />
          </div>

          {/* Check In */}
          <div className="field">
            <label>Check In</label>

            <input
              readOnly
              value={checkIn}
            />
          </div>

          {/* Check Out */}
          <div className="field">
            <label>Check Out</label>

            <input
              readOnly
              value={checkOut}
            />
          </div>

          {/* Worked Hours */}
          <div className="field">
            <label>Worked Hours</label>

            <input
              readOnly
              value={
                record.workedHours !== undefined
                  ? `${record.workedHours} hours`
                  : record.worked !== undefined
                  ? `${record.worked} hours`
                  : "-"
              }
            />
          </div>

          {/* Break Minutes */}
          <div className="field">
            <label>Break Minutes</label>

            <input
              readOnly
              value={
                record.breakMinutes !== undefined
                  ? `${record.breakMinutes} minutes`
                  : "-"
              }
            />
          </div>

        </div>
      </div>
    </Layout>
  );
}