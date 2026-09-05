import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

import {
  getPayslip,
  downloadPayslipPDF,
  sendPayslipEmail,
} from "../api/payslipApi";

export default function PayslipDetail() {
  const { id } = useParams();

  const [payslip, setPayslip] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH PAYSLIP
  // ==========================================

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("FETCHING PAYSLIP:", id);

        const response = await getPayslip(id);

        console.log(
          "PAYSLIP DETAIL RESPONSE:",
          response.data
        );

        setPayslip(response.data.data);
      } catch (err) {
        console.error(
          "FETCH PAYSLIP ERROR:",
          err
        );

        console.error(
          "BACKEND RESPONSE:",
          err.response?.data
        );

        setError(
          err.response?.data?.message ||
            "Failed to load payslip."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayslip();
  }, [id]);

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount) => {
    return `₹ ${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN"
    );
  };

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const handleDownloadPDF = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response =
        await downloadPayslipPDF(id);

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `payslip-${id}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setSuccess(
        "Payslip PDF downloaded successfully."
      );
    } catch (err) {
      console.error(
        "DOWNLOAD PDF ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to download payslip PDF."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // SEND EMAIL
  // ==========================================

  const handleSendEmail = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response =
        await sendPayslipEmail(id);

      console.log(
        "SEND EMAIL RESPONSE:",
        response.data
      );

      setPayslip((current) => ({
        ...current,
        emailSent:
          response.data.data?.emailSent ??
          true,
        emailSentAt:
          response.data.data?.emailSentAt ??
          new Date().toISOString(),
      }));

      setSuccess(
        "Payslip emailed successfully."
      );
    } catch (err) {
      console.error(
        "SEND EMAIL ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to send payslip email."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="empty-state">
          Loading payslip...
        </div>
      </Layout>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!payslip) {
    return (
      <Layout>
        <Link
          to="/payroll/payslips"
          className="back-link"
        >
          ← Back to Payslips
        </Link>

        <div
          className="empty-state"
          style={{
            marginTop: 20,
          }}
        >
          {error || "Payslip not found."}
        </div>
      </Layout>
    );
  }

  const employee =
    payslip.employeeSnapshot ||
    payslip.employee ||
    {};

  const contract =
    payslip.contractSnapshot || {};

  const salaryStructure =
    payslip.salaryStructureSnapshot || {};

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout>

      {/* ====================================== */}
      {/* BACK */}
      {/* ====================================== */}

      <Link
        to="/payroll/payslips"
        className="back-link"
      >
        ← Back to Payslips
      </Link>

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="page-header">

        <div>
          <div className="page-title">
            Payslip /{" "}
            {employee.firstName}{" "}
            {employee.lastName}
          </div>

          <div className="page-subtitle">
            {formatDate(
              payslip.periodStart
            )}
            {" → "}
            {formatDate(
              payslip.periodEnd
            )}
          </div>
        </div>

        <div className="toolbar">

          <StatusBadge
            status={payslip.status}
          />

          <button
            className="btn btn-primary"
            onClick={
              handleDownloadPDF
            }
            disabled={actionLoading}
          >
            {actionLoading
              ? "Processing..."
              : "Print PDF"}
          </button>

          <button
            className="btn"
            onClick={
              handleSendEmail
            }
            disabled={actionLoading}
          >
            {payslip.emailSent
              ? "Send Again"
              : "Send Email"}
          </button>

        </div>
      </div>

      {/* ====================================== */}
      {/* SUCCESS */}
      {/* ====================================== */}

      {success && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 8,
            background:
              "rgba(34, 197, 94, 0.10)",
          }}
        >
          {success}
        </div>
      )}

      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 8,
            background:
              "rgba(239, 68, 68, 0.10)",
          }}
        >
          {error}
        </div>
      )}

      {/* ====================================== */}
      {/* EMPLOYEE INFORMATION */}
      {/* ====================================== */}

      <div className="card">

        <div className="section-title">
          Employee Information
        </div>

        <div
          className="form-grid"
          style={{
            marginTop: 16,
          }}
        >

          <div>
            <div className="field-label">
              Employee
            </div>

            <strong>
              {employee.firstName}{" "}
              {employee.lastName}
            </strong>
          </div>

          <div>
            <div className="field-label">
              Employee Code
            </div>

            <strong>
              {employee.employeeCode ||
                "-"}
            </strong>
          </div>

          <div>
            <div className="field-label">
              Department
            </div>

            <strong>
              {employee.department ||
                "-"}
            </strong>
          </div>

          <div>
            <div className="field-label">
              Designation
            </div>

            <strong>
              {employee.designation ||
                "-"}
            </strong>
          </div>

          <div>
            <div className="field-label">
              Email
            </div>

            <strong>
              {employee.email || "-"}
            </strong>
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* PAYROLL INFORMATION */}
      {/* ====================================== */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >

        <div className="section-title">
          Payroll Information
        </div>

        <div
          className="form-grid"
          style={{
            marginTop: 16,
          }}
        >

          <div>
            <div className="field-label">
              Payroll Period
            </div>

            <strong>
              {formatDate(
                payslip.periodStart
              )}
              {" → "}
              {formatDate(
                payslip.periodEnd
              )}
            </strong>
          </div>

          <div>
            <div className="field-label">
              Pay Date
            </div>

            <strong>
              {formatDate(
                payslip.payDate
              )}
            </strong>
          </div>

          <div>
            <div className="field-label">
              Contract
            </div>

            <strong>
              {contract.contractNumber ||
                "-"}
            </strong>
          </div>

          <div>
            <div className="field-label">
              Salary Structure
            </div>

            <strong>
              {salaryStructure.name ||
                "-"}
            </strong>
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* ATTENDANCE */}
      {/* ====================================== */}

      <div
        className="form-grid"
        style={{
          marginTop: 20,
        }}
      >

        <div className="card">

          <div className="field-label">
            Working Days
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 5,
            }}
          >
            {payslip.workingDays}
          </div>

        </div>

        <div className="card">

          <div className="field-label">
            Worked Days
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 5,
            }}
          >
            {payslip.workedDays}
          </div>

        </div>

        <div className="card">

          <div className="field-label">
            Unpaid Leave
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 5,
            }}
          >
            {payslip.unpaidLeaveDays}
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* SALARY COMPUTATION */}
      {/* ====================================== */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >

        <div className="section-title">
          Salary Computation
        </div>

        <table
          className="data-table"
          style={{
            marginTop: 15,
          }}
        >

          <thead>
            <tr>
              <th>Code</th>
              <th>Component</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>

            {[
              ...(payslip.earnings || []),
              ...(payslip.deductions || []),
            ]
              .sort(
                (a, b) =>
                  (a.sequence || 0) -
                  (b.sequence || 0)
              )
              .map((line) => (
                <tr
                  key={`${line.code}-${line.sequence}`}
                >
                  <td>
                    {line.code}
                  </td>

                  <td>
                    {line.name}
                  </td>

                  <td>
                    {line.category}
                  </td>

                  <td
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    {formatMoney(
                      line.amount
                    )}
                  </td>
                </tr>
              ))}

          </tbody>

        </table>

      </div>

      {/* ====================================== */}
      {/* SALARY TOTALS */}
      {/* ====================================== */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >

        <div className="section-title">
          Salary Summary
        </div>

        <div
          style={{
            marginTop: 18,
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              padding: "10px 0",
            }}
          >
            <span>
              Gross Salary
            </span>

            <strong>
              {formatMoney(
                payslip.grossSalary
              )}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              padding: "10px 0",
            }}
          >
            <span>
              Total Deductions
            </span>

            <strong>
              {formatMoney(
                payslip.totalDeductions
              )}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              padding: "15px 0",
              marginTop: 8,
              borderTop:
                "1px solid var(--border)",
              fontSize: 18,
            }}
          >
            <strong>
              Net Salary
            </strong>

            <strong>
              {formatMoney(
                payslip.netSalary
              )}
            </strong>
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* WARNINGS */}
      {/* ====================================== */}

      {payslip.warnings?.length >
        0 && (
        <div
          className="card"
          style={{
            marginTop: 20,
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

            {payslip.warnings.map(
              (warning, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 8,
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
      {/* EMAIL STATUS */}
      {/* ====================================== */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >

        <div className="section-title">
          Payslip Delivery
        </div>

        <div
          style={{
            marginTop: 14,
          }}
        >

          <div>
            Email Status:{" "}
            <strong>
              {payslip.emailSent
                ? "Sent"
                : "Not Sent"}
            </strong>
          </div>

          {payslip.emailSentAt && (
            <div
              style={{
                marginTop: 6,
                opacity: 0.7,
              }}
            >
              Sent on{" "}
              {formatDate(
                payslip.emailSentAt
              )}
            </div>
          )}

        </div>

      </div>

    </Layout>
  );
}