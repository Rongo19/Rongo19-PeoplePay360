import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

import {
  getTimeOffRequests,
  createTimeOffRequest,
  getTimeOffTypes,
} from "../api/timeoffApi";

import { getEmployees } from "../api/employeeApi";

export default function TimeOffRequests() {
  const navigate = useNavigate();

  // ==========================================
  // LIST DATA
  // ==========================================

  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [timeOffTypes, setTimeOffTypes] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // MODAL
  // ==========================================

  const [showModal, setShowModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================
  // FORM
  // ==========================================

  const [form, setForm] = useState({
    employeeId: "",
    timeOffTypeId: "",
    startDate: "",
    endDate: "",
    requestedDays: "",
    reason: "",
  });

  // ==========================================
  // FETCH REQUESTS
  // ==========================================

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getTimeOffRequests();

      console.log(
        "TIME OFF REQUESTS:",
        response.data
      );

      setRequests(
        response.data.data || []
      );
    } catch (err) {
      console.error(
        "FETCH TIME OFF REQUESTS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load time off requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH EMPLOYEES
  // ==========================================

  const fetchEmployees = async () => {
    try {
      const response =
        await getEmployees({
          limit: 100,
        });

      console.log(
        "TIME OFF EMPLOYEES:",
        response.data
      );

      setEmployees(
        response.data.data?.employees ||
          response.data.data ||
          []
      );
    } catch (err) {
      console.error(
        "FETCH EMPLOYEES ERROR:",
        err
      );
    }
  };

  // ==========================================
  // FETCH TIME OFF TYPES
  // ==========================================

  const fetchTimeOffTypes = async () => {
    try {
      const response =
        await getTimeOffTypes();

      console.log(
        "TIME OFF TYPES:",
        response.data
      );

      setTimeOffTypes(
        response.data.data || []
      );
    } catch (err) {
      console.error(
        "FETCH TIME OFF TYPES ERROR:",
        err
      );
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchRequests();
    fetchEmployees();
    fetchTimeOffTypes();
  }, []);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString("en-IN");
  };

  // ==========================================
  // CALCULATE DAYS
  // ==========================================

  const calculateDays = (
    startDate,
    endDate
  ) => {
    if (!startDate || !endDate) {
      return "";
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return "";
    }

    const difference =
      end.getTime() -
      start.getTime();

    const days =
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return days;
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      // Automatically calculate requested days
      if (
        name === "startDate" ||
        name === "endDate"
      ) {
        const days = calculateDays(
          name === "startDate"
            ? value
            : previous.startDate,
          name === "endDate"
            ? value
            : previous.endDate
        );

        updated.requestedDays = days;
      }

      return updated;
    });
  };

  // ==========================================
  // OPEN MODAL
  // ==========================================

  const openCreateModal = () => {
    setForm({
      employeeId: "",
      timeOffTypeId: "",
      startDate: "",
      endDate: "",
      requestedDays: "",
      reason: "",
    });

    setFormError("");
    setSuccessMessage("");

    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeCreateModal = () => {
    if (submitting) return;

    setShowModal(false);
    setFormError("");
  };

  // ==========================================
  // CREATE REQUEST
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");

    // ------------------------------------------
    // BASIC VALIDATION
    // ------------------------------------------

    if (!form.employeeId) {
      setFormError(
        "Please select an employee."
      );
      return;
    }

    if (!form.timeOffTypeId) {
      setFormError(
        "Please select a time off type."
      );
      return;
    }

    if (!form.startDate) {
      setFormError(
        "Please select a start date."
      );
      return;
    }

    if (!form.endDate) {
      setFormError(
        "Please select an end date."
      );
      return;
    }

    if (
      new Date(form.endDate) <
      new Date(form.startDate)
    ) {
      setFormError(
        "End date cannot be before start date."
      );
      return;
    }

    const calculatedDays =
      calculateDays(
        form.startDate,
        form.endDate
      );

    if (!calculatedDays) {
      setFormError(
        "Unable to calculate requested days."
      );
      return;
    }

    // ------------------------------------------
    // PAYLOAD
    // ------------------------------------------

    const payload = {
      employeeId: form.employeeId,

      timeOffTypeId:
        form.timeOffTypeId,

      startDate:
        form.startDate,

      endDate:
        form.endDate,

      requestedDays:
        Number(calculatedDays),

      reason:
        form.reason.trim() || null,
    };

    console.log(
      "CREATE TIME OFF PAYLOAD:",
      payload
    );

    // ------------------------------------------
    // API CALL
    // ------------------------------------------

    try {
      setSubmitting(true);

      const response =
        await createTimeOffRequest(
          payload
        );

      console.log(
        "CREATE TIME OFF RESPONSE:",
        response.data
      );

      setSuccessMessage(
        response.data.message ||
          "Time off request created successfully."
      );

      // Close modal
      setShowModal(false);

      // Refresh table
      await fetchRequests();

      // Reset form
      setForm({
        employeeId: "",
        timeOffTypeId: "",
        startDate: "",
        endDate: "",
        requestedDays: "",
        reason: "",
      });
    } catch (err) {
      console.error(
        "CREATE TIME OFF ERROR:",
        err
      );

      const backendMessage =
        err.response?.data?.message;

      const zodErrors =
        err.response?.data?.errors;

      if (backendMessage) {
        setFormError(
          backendMessage
        );
      } else if (zodErrors) {
        setFormError(
          "Please check the entered values."
        );
      } else {
        setFormError(
          "Failed to create time off request."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // TABLE ROWS
  // ==========================================

  const rows = requests
    .map((request) => ({
      ...request,

      id: request._id,

      employeeName:
        request.employee
          ? `${request.employee.firstName || ""} ${
              request.employee.lastName || ""
            }`.trim()
          : "-",

      typeName:
        request.timeOffType?.name ||
        "-",

      start:
        formatDate(
          request.startDate
        ),

      end:
        formatDate(
          request.endDate
        ),

      duration:
        request.requestedDays ??
        "-",
    }))
    .filter((request) =>
      request.employeeName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ==========================================
  // COLUMNS
  // ==========================================

  const columns = [
    {
      key: "employeeName",
      label: "Employee",
    },

    {
      key: "typeName",
      label: "Time Off Type",
    },

    {
      key: "start",
      label: "Start",
    },

    {
      key: "end",
      label: "End",
    },

    {
      key: "duration",
      label: "Duration",
    },

    {
      key: "status",
      label: "Status",

      render: (r) => (
        <StatusBadge
          status={r.status}
        />
      ),
    },
  ];

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout>
      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="page-header">
        <div>
          <div className="page-title">
            Time Off Requests
          </div>

          <div className="page-subtitle">
            Requests support a simple
            approval flow
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search employees..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            className="btn btn-primary"
            onClick={
              openCreateModal
            }
          >
            New Time Off
          </button>
        </div>
      </div>

      {/* ====================================== */}
      {/* SUCCESS MESSAGE */}
      {/* ====================================== */}

      {successMessage && (
        <div
          className="card"
          style={{
            marginBottom: 15,
            color: "var(--success)",
          }}
        >
          {successMessage}
        </div>
      )}

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div
          className="card"
          style={{
            marginBottom: 15,
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="card">
        {loading ? (
          <div
            style={{
              padding: 20,
            }}
          >
            Loading time off requests...
          </div>
        ) : rows.length === 0 ? (
          <div
            className="empty-state"
            style={{
              padding: 30,
            }}
          >
            No time off requests found.
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={(row) =>
              navigate(
                `/timeoff/${row.id}`
              )
            }
          />
        )}
      </div>

      {/* ====================================== */}
      {/* CREATE MODAL */}
      {/* ====================================== */}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 650,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* MODAL HEADER */}

            <div
              className="page-header"
              style={{
                marginBottom: 20,
              }}
            >
              <div>
                <div className="page-title">
                  New Time Off Request
                </div>

                <div className="page-subtitle">
                  Submit a new leave request
                </div>
              </div>

              <button
                type="button"
                className="btn"
                onClick={
                  closeCreateModal
                }
              >
                ✕
              </button>
            </div>

            {/* FORM ERROR */}

            {formError && (
              <div
                style={{
                  marginBottom: 15,
                  padding: 12,
                  borderRadius: 8,
                  color:
                    "var(--danger)",
                  background:
                    "rgba(255, 0, 0, 0.06)",
                }}
              >
                {formError}
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div className="form-grid">
                {/* EMPLOYEE */}

                <div className="field">
                  <label>
                    Employee
                  </label>

                  <select
                    name="employeeId"
                    value={
                      form.employeeId
                    }
                    onChange={
                      handleChange
                    }
                    required
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
                          {employee.firstName}{" "}
                          {employee.lastName}{" "}
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

                {/* TIME OFF TYPE */}

                <div className="field">
                  <label>
                    Time Off Type
                  </label>

                  <select
                    name="timeOffTypeId"
                    value={
                      form.timeOffTypeId
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="">
                      Select time off type
                    </option>

                    {timeOffTypes
                      .filter(
                        (type) =>
                          type.isActive !==
                          false
                      )
                      .map(
                        (type) => (
                          <option
                            key={
                              type._id
                            }
                            value={
                              type._id
                            }
                          >
                            {type.name}{" "}
                            (
                            {
                              type.code
                            }
                            )
                          </option>
                        )
                      )}
                  </select>
                </div>

                {/* START DATE */}

                <div className="field">
                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      form.startDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                {/* END DATE */}

                <div className="field">
                  <label>
                    End Date
                  </label>

                  <input
                    type="date"
                    name="endDate"
                    value={
                      form.endDate
                    }
                    onChange={
                      handleChange
                    }
                    min={
                      form.startDate ||
                      undefined
                    }
                    required
                  />
                </div>

                {/* REQUESTED DAYS */}

                <div className="field">
                  <label>
                    Requested Days
                  </label>

                  <input
                    type="number"
                    value={
                      form.requestedDays
                    }
                    readOnly
                  />
                </div>

                {/* REASON */}

                <div
                  className="field"
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label>
                    Reason
                  </label>

                  <textarea
                    name="reason"
                    value={
                      form.reason
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter reason for leave..."
                    rows={4}
                    maxLength={1000}
                  />
                </div>
              </div>

              {/* BUTTONS */}

              <div
                className="toolbar"
                style={{
                  marginTop: 20,
                  justifyContent:
                    "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={
                    closeCreateModal
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? "Creating..."
                    : "Create Time Off"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}