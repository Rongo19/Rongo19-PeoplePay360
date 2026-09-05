import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import DataTable from "../components/DataTable";

import { getEmployees } from "../api/employeeApi";
import {
  previewPayrun,
  createPayrun,
} from "../api/payrunApi";

export default function NewPayRun() {
  const navigate = useNavigate();

  // ==========================================
  // EMPLOYEES
  // ==========================================

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState("");

  // ==========================================
  // PAYRUN FORM
  // ==========================================

  const [period, setPeriod] = useState("");
  const [payDate, setPayDate] = useState("");
  const [name, setName] = useState("");

  // ==========================================
  // SELECTION
  // ==========================================

  const [showSelect, setShowSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // ==========================================
  // PREVIEW
  // ==========================================

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // ==========================================
  // CREATE
  // ==========================================

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ==========================================
  // FETCH EMPLOYEES
  // ==========================================

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      setEmployeeError("");

      const response = await getEmployees({
        limit: 100,
      });

      console.log("NEW PAYRUN EMPLOYEES:", response.data);

      const data = response.data.data;

      const employeeList =
        data?.employees ||
        data ||
        [];

      const activeEmployees = employeeList.filter(
        (employee) =>
          employee.employmentStatus === "ACTIVE" ||
          !employee.employmentStatus
      );

      setEmployees(activeEmployees);
    } catch (err) {
      console.error("FETCH PAYRUN EMPLOYEES ERROR:", err);

      setEmployeeError(
        err.response?.data?.message ||
          "Failed to load employees."
      );
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ==========================================
  // PERIOD HELPERS
  // ==========================================

  const getPeriodDates = () => {
    if (!period) return null;

    const [year, month] = period
      .split("-")
      .map(Number);

    const periodStart = new Date(
      Date.UTC(year, month - 1, 1)
    );

    const periodEnd = new Date(
      Date.UTC(year, month, 0)
    );

    return {
      periodStart,
      periodEnd,
    };
  };

  const getPeriodLabel = () => {
    if (!period) return "";

    const [year, month] = period
      .split("-")
      .map(Number);

    return new Date(
      year,
      month - 1,
      1
    ).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  // ==========================================
  // PERIOD CHANGE
  // ==========================================

  const handlePeriodChange = (e) => {
    const value = e.target.value;

    setPeriod(value);
    setPreview(null);
    setPreviewError("");
    setCreateError("");

    if (!value) {
      setPayDate("");
      setName("");
      return;
    }

    const [year, month] = value
      .split("-")
      .map(Number);

    // Last day of selected month
    const lastDay = new Date(
      year,
      month,
      0
    );

    const formatted =
      `${lastDay.getFullYear()}-${String(
        lastDay.getMonth() + 1
      ).padStart(2, "0")}-${String(
        lastDay.getDate()
      ).padStart(2, "0")}`;

    setPayDate(formatted);

    setName(
      `${new Date(
        year,
        month - 1,
        1
      ).toLocaleDateString("en-IN", {
        month: "long",
      })} ${year} Payroll`
    );
  };

  // ==========================================
  // SELECT EMPLOYEE
  // ==========================================

  const toggleSelect = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter(
            (employeeId) =>
              employeeId !== id
          )
        : [...previous, id]
    );

    // Old preview is no longer valid
    setPreview(null);
    setCreateError("");
  };

  // ==========================================
  // SELECT ALL
  // ==========================================

  const selectAll = () => {
    if (
      selectedIds.length ===
      employees.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        employees.map(
          (employee) => employee._id
        )
      );
    }

    setPreview(null);
    setCreateError("");
  };

  // ==========================================
  // GENERATE PREVIEW
  // ==========================================

  const handleContinue = async () => {
    setPreviewError("");
    setCreateError("");

    if (!period) {
      setPreviewError(
        "Please select a payroll period."
      );
      return;
    }

    if (!selectedIds.length) {
      setPreviewError(
        "Please select at least one employee."
      );
      setShowSelect(true);
      return;
    }

    if (!name.trim()) {
      setPreviewError(
        "Please enter a payrun name."
      );
      return;
    }

    const dates = getPeriodDates();

    if (!dates) {
      setPreviewError(
        "Invalid payroll period."
      );
      return;
    }

    setShowSelect(true);

    try {
      setPreviewLoading(true);

      const payload = {
        periodStart:
          dates.periodStart.toISOString(),

        periodEnd:
          dates.periodEnd.toISOString(),

        payDate: payDate
          ? new Date(
              `${payDate}T00:00:00`
            ).toISOString()
          : null,

        employeeIds: selectedIds,
      };

      console.log(
        "PAYRUN PREVIEW PAYLOAD:",
        payload
      );

      const response =
        await previewPayrun(payload);

      console.log(
        "PAYRUN PREVIEW RESPONSE:",
        response.data
      );

      setPreview(
        response.data.data
      );
    } catch (err) {
      console.error(
        "PAYRUN PREVIEW ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setPreviewError(
        err.response?.data?.message ||
          "Unable to generate payroll preview."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  // ==========================================
  // CREATE PAYRUN
  // ==========================================

  const handleCreate = async () => {
    setCreateError("");

    if (!selectedIds.length) {
      setCreateError(
        "Please select at least one employee."
      );
      return;
    }

    if (!preview) {
      setCreateError(
        "Please generate the payroll preview first."
      );
      return;
    }

    if (!period) {
      setCreateError(
        "Please select a payroll period."
      );
      return;
    }

    if (!name.trim()) {
      setCreateError(
        "Please enter a payrun name."
      );
      return;
    }

    const dates = getPeriodDates();

    if (!dates) {
      setCreateError(
        "Invalid payroll period."
      );
      return;
    }

    const payload = {
      name: name.trim(),

      periodStart:
        dates.periodStart.toISOString(),

      periodEnd:
        dates.periodEnd.toISOString(),

      payDate: payDate
        ? new Date(
            `${payDate}T00:00:00`
          ).toISOString()
        : null,

      employeeIds: selectedIds,
    };

    console.log(
      "CREATE PAYRUN PAYLOAD:",
      payload
    );

    try {
      setCreating(true);

      const response =
        await createPayrun(payload);

      console.log(
        "CREATE PAYRUN RESPONSE:",
        response.data
      );

      const createdPayrun =
        response.data.data;

      if (!createdPayrun?._id) {
        throw new Error(
          "Payrun was created but no Payrun ID was returned."
        );
      }

      navigate(
        `/payroll/payruns/${createdPayrun._id}`
      );
    } catch (err) {
      console.error(
        "CREATE PAYRUN ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setCreateError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to create payrun."
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns = [
    {
      key: "select",
      label: "",

      render: (employee) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(
            employee._id
          )}
          onChange={() =>
            toggleSelect(
              employee._id
            )
          }
          onClick={(e) =>
            e.stopPropagation()
          }
        />
      ),
    },

    {
      key: "employee",
      label: "Employee",

      render: (employee) =>
        `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.trim(),
    },

    {
      key: "employeeCode",
      label: "Employee Code",
    },

    {
      key: "department",
      label: "Department",
    },

    {
      key: "designation",
      label: "Designation",
    },

    {
      key: "dateOfJoining",
      label: "Joined",

      render: (employee) =>
        employee.dateOfJoining
          ? new Date(
              employee.dateOfJoining
            ).toLocaleDateString(
              "en-IN"
            )
          : "-",
    },
  ];

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const money = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  };

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
            New Pay Run
          </div>

          <div className="page-subtitle">
            Create a payroll batch using
            real employee and contract data
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* PAYRUN SETTINGS */}
      {/* ====================================== */}

      <div className="card">
        <div className="section-title">
          Payroll Settings
        </div>

        <div className="form-grid">

          <div className="field">
            <label>
              Payrun Name
            </label>

            <input
              type="text"
              placeholder="September 2026 Payroll"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Payroll Period
            </label>

            <input
              type="month"
              value={period}
              onChange={
                handlePeriodChange
              }
            />
          </div>

          <div className="field">
            <label>
              Pay Date
            </label>

            <input
              type="date"
              value={payDate}
              onChange={(e) =>
                setPayDate(
                  e.target.value
                )
              }
            />
          </div>

        </div>

        {period && (
          <div
            style={{
              marginTop: 15,
              opacity: 0.75,
            }}
          >
            Payroll period:{" "}
            <strong>
              {getPeriodLabel()}
            </strong>
          </div>
        )}

        {previewError && (
          <div
            style={{
              marginTop: 15,
              color: "var(--danger)",
            }}
          >
            {previewError}
          </div>
        )}

        <div
          className="toolbar"
          style={{
            marginTop: 20,
          }}
        >
          <button
            className="btn btn-primary"
            onClick={
              handleContinue
            }
            disabled={
              previewLoading
            }
          >
            {previewLoading
              ? "Generating Preview..."
              : "Preview Payroll"}
          </button>

          <button
            className="btn"
            onClick={() =>
              navigate(
                "/payroll/payruns"
              )
            }
          >
            Discard
          </button>
        </div>
      </div>

      {/* ====================================== */}
      {/* EMPLOYEE SELECTION */}
      {/* ====================================== */}

      {showSelect && (
        <div
          className="card"
          style={{
            marginTop: 20,
          }}
        >
          <div
            className="page-header"
            style={{
              marginBottom: 15,
            }}
          >
            <div>
              <div className="section-title">
                Select Employees
              </div>

              <div
                style={{
                  opacity: 0.7,
                }}
              >
                {selectedIds.length} of{" "}
                {employees.length} employees
                selected
              </div>
            </div>

            <button
              className="btn"
              onClick={selectAll}
            >
              {selectedIds.length ===
              employees.length
                ? "Clear All"
                : "Select All"}
            </button>
          </div>

          {/* EMPLOYEE ERROR */}

          {employeeError && (
            <div
              style={{
                marginBottom: 15,
                color:
                  "var(--danger)",
              }}
            >
              {employeeError}
            </div>
          )}

          {/* CREATE ERROR */}

          {createError && (
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
              {createError}
            </div>
          )}

          {/* EMPLOYEE TABLE */}

          {loadingEmployees ? (
            <div
              style={{
                padding: 20,
              }}
            >
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div
              className="empty-state"
              style={{
                padding: 30,
              }}
            >
              No active employees found.
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={employees}
              keyField="_id"
            />
          )}

          {/* ================================= */}
          {/* PAYROLL PREVIEW */}
          {/* ================================= */}

          {preview && (
            <div
              style={{
                marginTop: 25,
              }}
            >
              <div className="section-title">
                Payroll Preview
              </div>

              {/* SUMMARY CARDS */}

              <div
                className="form-grid"
                style={{
                  marginTop: 15,
                }}
              >
                <div className="card">
                  <div
                    style={{
                      opacity: 0.7,
                      fontSize: 13,
                    }}
                  >
                    Employees
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      marginTop: 5,
                    }}
                  >
                    {preview.totalEmployees ||
                      0}
                  </div>
                </div>

                <div className="card">
                  <div
                    style={{
                      opacity: 0.7,
                      fontSize: 13,
                    }}
                  >
                    Gross Salary
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      marginTop: 5,
                    }}
                  >
                    {money(
                      preview.totalGross
                    )}
                  </div>
                </div>

                <div className="card">
                  <div
                    style={{
                      opacity: 0.7,
                      fontSize: 13,
                    }}
                  >
                    Deductions
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      marginTop: 5,
                    }}
                  >
                    {money(
                      preview.totalDeductions
                    )}
                  </div>
                </div>

                <div className="card">
                  <div
                    style={{
                      opacity: 0.7,
                      fontSize: 13,
                    }}
                  >
                    Net Salary
                  </div>

                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      marginTop: 5,
                    }}
                  >
                    {money(
                      preview.totalNet
                    )}
                  </div>
                </div>
              </div>

              {/* ================================= */}
              {/* WARNINGS */}
              {/* ================================= */}

              {preview.warnings?.length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 15,
                    borderRadius: 8,
                    background:
                      "rgba(255, 193, 7, 0.10)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    ⚠ Payroll Warnings
                  </div>

                  {preview.warnings.map(
                    (warning, index) => (
                      <div
                        key={index}
                        style={{
                          marginTop: 6,
                        }}
                      >
                        • {warning}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* ================================= */}
              {/* EMPLOYEE PAYROLL BREAKDOWN */}
              {/* ================================= */}

              {preview.employees?.length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: 12,
                          }}
                        >
                          Employee
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: 12,
                          }}
                        >
                          Contract
                        </th>

                        <th
                          style={{
                            textAlign: "right",
                            padding: 12,
                          }}
                        >
                          Gross
                        </th>

                        <th
                          style={{
                            textAlign: "right",
                            padding: 12,
                          }}
                        >
                          Deductions
                        </th>

                        <th
                          style={{
                            textAlign: "right",
                            padding: 12,
                          }}
                        >
                          Net
                        </th>

                        <th
                          style={{
                            textAlign: "center",
                            padding: 12,
                          }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {preview.employees.map(
                        (item, index) => {
                          const employee =
                            employees.find(
                              (emp) =>
                                emp._id ===
                                item.employee
                            );

                          return (
                            <tr
                              key={
                                item.employee ||
                                index
                              }
                            >
                              <td
                                style={{
                                  padding: 12,
                                }}
                              >
                                <strong>
                                  {employee
                                    ? `${employee.firstName} ${employee.lastName}`
                                    : "Employee"}
                                </strong>

                                <div
                                  style={{
                                    fontSize: 12,
                                    opacity: 0.6,
                                  }}
                                >
                                  {employee?.employeeCode ||
                                    ""}
                                </div>
                              </td>

                              <td
                                style={{
                                  padding: 12,
                                }}
                              >
                                {item.contract
                                  ?.contractNumber ||
                                  "—"}
                              </td>

                              <td
                                style={{
                                  padding: 12,
                                  textAlign:
                                    "right",
                                }}
                              >
                                {money(
                                  item.grossSalary
                                )}
                              </td>

                              <td
                                style={{
                                  padding: 12,
                                  textAlign:
                                    "right",
                                }}
                              >
                                {money(
                                  item.totalDeductions
                                )}
                              </td>

                              <td
                                style={{
                                  padding: 12,
                                  textAlign:
                                    "right",
                                  fontWeight: 700,
                                }}
                              >
                                {money(
                                  item.netSalary
                                )}
                              </td>

                              <td
                                style={{
                                  padding: 12,
                                  textAlign:
                                    "center",
                                }}
                              >
                                {item.success ? (
                                  <span>
                                    ✓ Ready
                                  </span>
                                ) : (
                                  <span>
                                    ⚠ Warning
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ================================= */}
              {/* CREATE ACTIONS */}
              {/* ================================= */}

              <div
                className="toolbar"
                style={{
                  marginTop: 25,
                }}
              >
                <button
                  className="btn btn-primary"
                  disabled={
                    selectedIds.length ===
                      0 ||
                    !preview ||
                    creating
                  }
                  onClick={
                    handleCreate
                  }
                >
                  {creating
                    ? "Creating Payrun..."
                    : `Create Payrun (${selectedIds.length})`}
                </button>

                <button
                  className="btn"
                  onClick={() =>
                    setShowSelect(
                      false
                    )
                  }
                  disabled={
                    creating
                  }
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}