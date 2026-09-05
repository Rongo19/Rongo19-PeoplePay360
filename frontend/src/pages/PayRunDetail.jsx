import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

import {
  getPayrun,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
} from "../api/payrunApi";

export default function PayRunDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [payrun, setPayrun] = useState(null);
  const [payslips, setPayslips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH PAYRUN
  // ==========================================

  const fetchPayrun = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPayrun(id);

      console.log(
        "PAYRUN DETAIL RESPONSE:",
        response.data
      );

      const data = response.data.data;

      setPayrun(data?.payrun || null);
      setPayslips(data?.payslips || []);
    } catch (err) {
      console.error(
        "FETCH PAYRUN DETAIL ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load payrun."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrun();
  }, [id]);

  // ==========================================
  // COMPUTE
  // ==========================================

  const handleCompute = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response =
        await computePayrun(id);

      console.log(
        "COMPUTE PAYRUN RESPONSE:",
        response.data
      );

      const data = response.data.data;

      setPayrun(data?.payrun || null);
      setPayslips(data?.payslips || []);
    } catch (err) {
      console.error(
        "COMPUTE PAYRUN ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to compute payrun."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // VALIDATE
  // ==========================================

  const handleValidate = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response =
        await validatePayrun(id);

      console.log(
        "VALIDATE PAYRUN RESPONSE:",
        response.data
      );

      const data = response.data.data;

      setPayrun(data?.payrun || null);
      setPayslips(data?.payslips || []);
    } catch (err) {
      console.error(
        "VALIDATE PAYRUN ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to validate payrun."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // MARK PAID
  // ==========================================

  const handleMarkPaid = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response =
        await markPayrunPaid(id);

      console.log(
        "MARK PAID RESPONSE:",
        response.data
      );

      const data = response.data.data;

      setPayrun(data?.payrun || null);
      setPayslips(data?.payslips || []);
    } catch (err) {
      console.error(
        "MARK PAID ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to mark payrun as paid."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const money = (value) => {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(
      value
    ).toLocaleDateString("en-IN");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="empty-state">
          Loading payrun...
        </div>
      </Layout>
    );
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (!payrun) {
    return (
      <Layout>
        <Link
          to="/payroll/payruns"
          className="back-link"
        >
          ← Back to Payruns
        </Link>

        <div
          className="empty-state"
          style={{
            marginTop: 20,
          }}
        >
          {error || "Payrun not found."}
        </div>
      </Layout>
    );
  }

  // ==========================================
  // PAYSLIP TABLE
  // ==========================================

  const payslipRows =
    payslips.map((payslip) => ({
      ...payslip,

      employeeName:
        payslip.employee
          ? `${payslip.employee.firstName || ""} ${
              payslip.employee.lastName || ""
            }`.trim()
          : payslip.employeeSnapshot
          ? `${payslip.employeeSnapshot.firstName || ""} ${
              payslip.employeeSnapshot.lastName || ""
            }`.trim()
          : "-",

      employeeCode:
        payslip.employee?.employeeCode ||
        payslip.employeeSnapshot?.employeeCode ||
        "-",
    }));

  const columns = [
    {
      key: "employeeName",
      label: "Employee",

      render: (row) => (
        <div>
          <strong>
            {row.employeeName}
          </strong>

          <div
            style={{
              fontSize: 12,
              opacity: 0.6,
              marginTop: 3,
            }}
          >
            {row.employeeCode}
          </div>
        </div>
      ),
    },

    {
      key: "grossSalary",
      label: "Gross",

      render: (row) =>
        money(row.grossSalary),
    },

    {
      key: "totalDeductions",
      label: "Deductions",

      render: (row) =>
        money(
          row.totalDeductions
        ),
    },

    {
      key: "netSalary",
      label: "Net Salary",

      render: (row) => (
        <strong>
          {money(row.netSalary)}
        </strong>
      ),
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

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout>

      {/* ====================================== */}
      {/* BACK */}
      {/* ====================================== */}

      <Link
        to="/payroll/payruns"
        className="back-link"
      >
        ← Back to Payruns
      </Link>

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="page-header">

        <div>
          <div className="page-title">
            {payrun.name}
          </div>

          <div className="page-subtitle">
            {formatDate(
              payrun.periodStart
            )}
            {" → "}
            {formatDate(
              payrun.periodEnd
            )}
          </div>
        </div>

        <div className="toolbar">

          <StatusBadge
            status={payrun.status}
          />

          {/* DRAFT */}

          {payrun.status ===
            "DRAFT" && (
            <button
              className="btn btn-primary"
              onClick={
                handleCompute
              }
              disabled={
                actionLoading
              }
            >
              {actionLoading
                ? "Computing..."
                : "Compute Payroll"}
            </button>
          )}

          {/* COMPUTED */}

          {payrun.status ===
            "COMPUTED" && (
            <button
              className="btn btn-primary"
              onClick={
                handleValidate
              }
              disabled={
                actionLoading
              }
            >
              {actionLoading
                ? "Validating..."
                : "Validate Payroll"}
            </button>
          )}

          {/* VALIDATED */}

          {payrun.status ===
            "VALIDATED" && (
            <button
              className="btn btn-primary"
              onClick={
                handleMarkPaid
              }
              disabled={
                actionLoading
              }
            >
              {actionLoading
                ? "Processing..."
                : "Mark as Paid"}
            </button>
          )}

        </div>
      </div>

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 8,
            color: "var(--danger)",
            background:
              "rgba(255, 0, 0, 0.06)",
          }}
        >
          {error}
        </div>
      )}

      {/* ====================================== */}
      {/* PAYRUN SUMMARY */}
      {/* ====================================== */}

      <div className="form-grid">

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
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {payrun.totalEmployees ||
              payrun.employees?.length ||
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
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {money(
              payrun.totalGross
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
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {money(
              payrun.totalDeductions
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
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {money(
              payrun.totalNet
            )}
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* PAYRUN INFORMATION */}
      {/* ====================================== */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >

        <div className="section-title">
          Payrun Information
        </div>

        <div
          className="form-grid"
          style={{
            marginTop: 15,
          }}
        >

          <div>
            <div
              style={{
                opacity: 0.6,
                fontSize: 13,
              }}
            >
              Payroll Period
            </div>

            <strong>
              {formatDate(
                payrun.periodStart
              )}
              {" → "}
              {formatDate(
                payrun.periodEnd
              )}
            </strong>
          </div>

          <div>
            <div
              style={{
                opacity: 0.6,
                fontSize: 13,
              }}
            >
              Pay Date
            </div>

            <strong>
              {formatDate(
                payrun.payDate
              )}
            </strong>
          </div>

          <div>
            <div
              style={{
                opacity: 0.6,
                fontSize: 13,
              }}
            >
              Status
            </div>

            <strong>
              {payrun.status}
            </strong>
          </div>

          <div>
            <div
              style={{
                opacity: 0.6,
                fontSize: 13,
              }}
            >
              Created
            </div>

            <strong>
              {formatDate(
                payrun.createdAt
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* WARNINGS */}
      {/* ====================================== */}

      {payrun.warnings?.length >
        0 && (
        <div
          className="card"
          style={{
            marginTop: 20,
            background:
              "rgba(255, 193, 7, 0.08)",
          }}
        >

          <div className="section-title">
            ⚠ Payroll Warnings
          </div>

          <div
            style={{
              marginTop: 12,
            }}
          >
            {payrun.warnings.map(
              (warning, index) => (
                <div
                  key={index}
                  style={{
                    marginTop: 7,
                  }}
                >
                  • {warning}
                </div>
              )
            )}
          </div>

        </div>
      )}

      {/* ====================================== */}
      {/* PAYSLIPS */}
      {/* ====================================== */}

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
              Payslips
            </div>

            <div
              style={{
                opacity: 0.65,
                marginTop: 4,
              }}
            >
              {payslips.length} payslip
              {payslips.length !== 1
                ? "s"
                : ""} generated
            </div>
          </div>

        </div>

        {payslips.length === 0 ? (

          <div
            className="empty-state"
            style={{
              padding: 35,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              No payslips generated yet
            </div>

            <div
              style={{
                opacity: 0.65,
                marginBottom: 18,
              }}
            >
              This payrun is still in{" "}
              <strong>
                {payrun.status}
              </strong>{" "}
              status.
            </div>

            {payrun.status ===
              "DRAFT" && (
              <button
                className="btn btn-primary"
                onClick={
                  handleCompute
                }
                disabled={
                  actionLoading
                }
              >
                {actionLoading
                  ? "Computing..."
                  : "Compute Payroll"}
              </button>
            )}
          </div>

        ) : (

          <DataTable
            columns={columns}
            rows={payslipRows}
            keyField="_id"
            onRowClick={(row) =>
              navigate(
                `/payroll/payslips/${row._id}`
              )
            }
          />

        )}

      </div>

    </Layout>
  );
}