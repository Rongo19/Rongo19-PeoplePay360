import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

import {
  getTimeOffRequest,
  approveTimeOffRequest,
  rejectTimeOffRequest,
  cancelTimeOffRequest,
} from "../api/timeoffApi";

export default function TimeOffRequestDetail() {
  const { id } = useParams();

  const [record, setRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH REQUEST
  // ==========================================

  const fetchRequest = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getTimeOffRequest(id);

      console.log(
        "TIME OFF REQUEST DETAIL:",
        response.data
      );

      setRecord(
        response.data.data
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load time off request."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  // ==========================================
  // APPROVE
  // ==========================================

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setError("");

      const response =
        await approveTimeOffRequest(id);

      setRecord(
        response.data.data
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to approve request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // REJECT
  // ==========================================

  const handleReject = async () => {
    const reason = window.prompt(
      "Enter rejection reason:"
    );

    if (!reason) return;

    try {
      setActionLoading(true);
      setError("");

      const response =
        await rejectTimeOffRequest(
          id,
          {
            rejectionReason:
              reason.trim(),
          }
        );

      setRecord(
        response.data.data
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to reject request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this request?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response =
        await cancelTimeOffRequest(id);

      setRecord(
        response.data.data
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to cancel request."
      );
    } finally {
      setActionLoading(false);
    }
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
  // LOADING / ERROR
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="empty-state">
          Loading time off request...
        </div>
      </Layout>
    );
  }

  if (error && !record) {
    return (
      <Layout>
        <div className="empty-state">
          {error}
        </div>
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout>
        <div className="empty-state">
          Time off request not found.
        </div>
      </Layout>
    );
  }

  // ==========================================
  // EMPLOYEE
  // ==========================================

  const employeeName =
    record.employee
      ? `${record.employee.firstName || ""} ${
          record.employee.lastName || ""
        }`.trim()
      : "-";

  const timeOffType =
    record.timeOffType?.name ||
    "-";

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout>
      <Link
        to="/timeoff"
        className="back-link"
      >
        ← Back to Time Off Requests
      </Link>

      <div className="page-header">
        <div>
          <div className="page-title">
            Time Off Request /{" "}
            {employeeName}
          </div>

          <div className="page-subtitle">
            One view of a time off request
          </div>
        </div>

        <StatusBadge
          status={record.status}
        />
      </div>

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

      <div className="card">
        <div className="form-grid">
          {/* EMPLOYEE */}

          <div className="field">
            <label>Employee</label>

            <input
              readOnly
              value={employeeName}
            />
          </div>

          {/* TYPE */}

          <div className="field">
            <label>Time Off Type</label>

            <input
              readOnly
              value={timeOffType}
            />
          </div>

          {/* START */}

          <div className="field">
            <label>Start Date</label>

            <input
              readOnly
              value={formatDate(
                record.startDate
              )}
            />
          </div>

          {/* END */}

          <div className="field">
            <label>End Date</label>

            <input
              readOnly
              value={formatDate(
                record.endDate
              )}
            />
          </div>

          {/* DURATION */}

          <div className="field">
            <label>Duration</label>

            <input
              readOnly
              value={
                record.requestedDays ??
                "-"
              }
            />
          </div>

          {/* REASON */}

          <div className="field">
            <label>Reason</label>

            <input
              readOnly
              value={
                record.reason || "-"
              }
            />
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="toolbar"
          style={{ marginTop: 18 }}
        >
          {record.status ===
            "PENDING" && (
            <>
              <button
                className="btn btn-primary"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "Approve"}
              </button>

              <button
                className="btn"
                onClick={handleReject}
                disabled={actionLoading}
              >
                Refuse
              </button>
            </>
          )}

          {record.status ===
            "APPROVED" && (
            <button
              className="btn"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Cancelling..."
                : "Cancel Request"}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}