import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

import { getPayruns } from "../api/payrunApi";

export default function PayRuns() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [payruns, setPayruns] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH PAYRUNS
  // ==========================================

  const fetchPayruns = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPayruns();

      console.log(
        "PAYRUNS RESPONSE:",
        response.data
      );

      const data = response.data.data;

      // Support common backend response shapes
      setPayruns(
        data?.payruns ||
          data ||
          []
      );
    } catch (err) {
      console.error(
        "FETCH PAYRUNS ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          "Failed to load payruns."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchPayruns();
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
  // FORMAT PERIOD
  // ==========================================

  const formatPeriod = (payrun) => {
    // If backend already provides a period string
    if (payrun.period) {
      return payrun.period;
    }

    // Otherwise construct it from dates
    if (
      payrun.periodStart &&
      payrun.periodEnd
    ) {
      return `${formatDate(
        payrun.periodStart
      )} - ${formatDate(
        payrun.periodEnd
      )}`;
    }

    return "-";
  };

  // ==========================================
  // PREPARE TABLE ROWS
  // ==========================================

  const rows = payruns.map(
    (payrun) => ({
      ...payrun,

      id: payrun._id,

      period:
        formatPeriod(payrun),

      employees:
        payrun.employeeCount ??
        payrun.employees?.length ??
        payrun.totalEmployees ??
        0,
    })
  );

  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns = [
    {
      key: "period",
      label: "Period",
    },

    {
      key: "employees",
      label: "Employees",
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
      {/* HEADER */}
      {/* ====================================== */}

      <div className="page-header">
        <div>
          <div className="page-title">
            Payruns
          </div>

          <div className="page-subtitle">
            Payroll processing batches from
            the database
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() =>
            navigate(
              "/payroll/payruns/new"
            )
          }
        >
          New Pay Run
        </button>
      </div>

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
            Loading payruns...
          </div>
        ) : rows.length === 0 ? (
          <div
            className="empty-state"
            style={{
              padding: 30,
            }}
          >
            No payruns found.
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={(row) =>
              navigate(
                `/payroll/payruns/${row.id}`
              )
            }
          />
        )}
      </div>
    </Layout>
  );
}