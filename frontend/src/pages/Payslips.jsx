import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

import { getPayslips } from "../api/payslipApi";

export default function Payslips() {
  const [payslips, setPayslips] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH REAL PAYSLIPS FROM BACKEND
  // ==========================================

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("FETCHING PAYSLIPS FROM DATABASE...");

      const response = await getPayslips();

      console.log(
        "PAYSLIPS API RESPONSE:",
        response.data
      );

      setPayslips(response.data.data || []);
    } catch (err) {
      console.error(
        "FETCH PAYSLIPS ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load payslips."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

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
  // EMPLOYEE NAME
  // ==========================================

  const getEmployeeName = (payslip) => {
    if (payslip.employeeSnapshot) {
      return `${payslip.employeeSnapshot.firstName || ""} ${
        payslip.employeeSnapshot.lastName || ""
      }`.trim();
    }

    if (payslip.employee) {
      return `${payslip.employee.firstName || ""} ${
        payslip.employee.lastName || ""
      }`.trim();
    }

    return "Unknown Employee";
  };

  // ==========================================
  // EMPLOYEE CODE
  // ==========================================

  const getEmployeeCode = (payslip) => {
    return (
      payslip.employeeSnapshot?.employeeCode ||
      payslip.employee?.employeeCode ||
      "-"
    );
  };

  // ==========================================
  // PAYRUN NAME
  // ==========================================

  const getPayrunName = (payslip) => {
    return (
      payslip.payrun?.name ||
      "Payroll"
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="empty-state">
          Loading payslips...
        </div>
      </Layout>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <Layout>
        <div className="page-header">
          <div>
            <div className="page-title">
              Payslips
            </div>

            <div className="page-subtitle">
              Employee payroll records
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            marginTop: 20,
            padding: 20,
          }}
        >
          {error}

          <button
            className="btn btn-primary"
            style={{
              marginTop: 15,
            }}
            onClick={fetchPayslips}
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

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
            Payslips
          </div>

          <div className="page-subtitle">
            Employee payroll records
          </div>
        </div>

        <div className="toolbar">

          <button
            className="btn"
            onClick={fetchPayslips}
          >
            Refresh
          </button>

        </div>

      </div>

      {/* ====================================== */}
      {/* SUMMARY */}
      {/* ====================================== */}

      <div className="form-grid">

        <div className="card">

          <div className="field-label">
            Total Payslips
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {payslips.length}
          </div>

        </div>

        <div className="card">

          <div className="field-label">
            Total Gross
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {formatMoney(
              payslips.reduce(
                (sum, payslip) =>
                  sum +
                  Number(
                    payslip.grossSalary ||
                      0
                  ),
                0
              )
            )}
          </div>

        </div>

        <div className="card">

          <div className="field-label">
            Total Deductions
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {formatMoney(
              payslips.reduce(
                (sum, payslip) =>
                  sum +
                  Number(
                    payslip.totalDeductions ||
                      0
                  ),
                0
              )
            )}
          </div>

        </div>

        <div className="card">

          <div className="field-label">
            Total Net
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginTop: 6,
            }}
          >
            {formatMoney(
              payslips.reduce(
                (sum, payslip) =>
                  sum +
                  Number(
                    payslip.netSalary ||
                      0
                  ),
                0
              )
            )}
          </div>

        </div>

      </div>

      {/* ====================================== */}
      {/* PAYSLIPS TABLE */}
      {/* ====================================== */}

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >

        <div className="section-title">
          Payroll Records
        </div>

        {payslips.length === 0 ? (

          <div
            className="empty-state"
            style={{
              padding: 40,
            }}
          >
            No payslips found.

            <div
              style={{
                marginTop: 10,
                opacity: 0.65,
              }}
            >
              Payslips will appear here after
              a Payrun has been computed.
            </div>
          </div>

        ) : (

          <div
            style={{
              overflowX: "auto",
              marginTop: 15,
            }}
          >

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Employee
                  </th>

                  <th>
                    Payrun
                  </th>

                  <th>
                    Period
                  </th>

                  <th>
                    Gross
                  </th>

                  <th>
                    Deductions
                  </th>

                  <th>
                    Net
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Email
                  </th>

                </tr>

              </thead>

              <tbody>

                {payslips.map(
                  (payslip) => (

                    <tr
                      key={payslip._id}
                    >

                      {/* EMPLOYEE */}

                      <td>

                        <Link
                          to={`/payroll/payslips/${payslip._id}`}
                          style={{
                            textDecoration:
                              "none",
                          }}
                        >

                          <strong>
                            {getEmployeeName(
                              payslip
                            )}
                          </strong>

                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.6,
                              marginTop: 3,
                            }}
                          >
                            {
                              getEmployeeCode(
                                payslip
                              )
                            }
                          </div>

                        </Link>

                      </td>

                      {/* PAYRUN */}

                      <td>
                        {getPayrunName(
                          payslip
                        )}
                      </td>

                      {/* PERIOD */}

                      <td>

                        {formatDate(
                          payslip.periodStart
                        )}

                        {" → "}

                        {formatDate(
                          payslip.periodEnd
                        )}

                      </td>

                      {/* GROSS */}

                      <td>
                        {formatMoney(
                          payslip.grossSalary
                        )}
                      </td>

                      {/* DEDUCTIONS */}

                      <td>
                        {formatMoney(
                          payslip.totalDeductions
                        )}
                      </td>

                      {/* NET */}

                      <td>

                        <strong>
                          {formatMoney(
                            payslip.netSalary
                          )}
                        </strong>

                      </td>

                      {/* STATUS */}

                      <td>

                        <StatusBadge
                          status={
                            payslip.status
                          }
                        />

                      </td>

                      {/* EMAIL */}

                      <td>

                        {payslip.emailSent ? (
                          <span>
                            ✓ Sent
                          </span>
                        ) : (
                          <span
                            style={{
                              opacity: 0.6,
                            }}
                          >
                            Not Sent
                          </span>
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </Layout>
  );
}