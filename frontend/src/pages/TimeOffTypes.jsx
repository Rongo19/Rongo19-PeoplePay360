import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";

import {
  getTimeOffTypes,
  createTimeOffType,
} from "../api/timeoffApi";

export default function TimeOffTypes() {
  const [timeOffTypes, setTimeOffTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    isPaid: true,
    requiresApproval: true,
    isActive: true,
  });

  // ==========================================
  // GET TIME OFF TYPES
  // ==========================================

  const fetchTimeOffTypes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTimeOffTypes();

      console.log(
        "TIME OFF TYPES RESPONSE:",
        response.data
      );

      setTimeOffTypes(
        response.data?.data || []
      );
    } catch (err) {
      console.error(
        "TIME OFF TYPES ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load time off types."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeOffTypes();
  }, []);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // CREATE TIME OFF TYPE
  // ==========================================

  const handleCreate = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");

    // Basic frontend validation
    const name = form.name.trim();
    const code = form.code
      .trim()
      .toUpperCase();
    const description =
      form.description.trim();

    if (name.length < 2) {
      setFormError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (code.length < 2) {
      setFormError(
        "Code must contain at least 2 characters."
      );
      return;
    }

    try {
      setCreating(true);

      const payload = {
        name,
        code,
        description,
        isPaid: Boolean(form.isPaid),
        requiresApproval: Boolean(
          form.requiresApproval
        ),
        isActive: Boolean(form.isActive),
      };

      console.log(
        "SENDING CREATE TIME OFF TYPE:",
        payload
      );

      const response =
        await createTimeOffType(payload);

      console.log(
        "CREATE TIME OFF TYPE RESPONSE:",
        response.data
      );

      // ----------------------------------------
      // SUCCESS
      // ----------------------------------------

      setSuccessMessage(
        response.data?.message ||
          "Time off type created successfully."
      );

      // Reset form
      setForm({
        name: "",
        code: "",
        description: "",
        isPaid: true,
        requiresApproval: true,
        isActive: true,
      });

      // Close form
      setShowForm(false);

      // Refresh table from MongoDB
      await fetchTimeOffTypes();

    } catch (err) {
      console.error(
        "CREATE TIME OFF TYPE ERROR:",
        err
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      // Show exact backend error
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create time off type.";

      setFormError(message);

    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // TABLE COLUMNS
  // ==========================================

  const columns = [
    {
      key: "name",
      label: "Time Off Type",
    },

    {
      key: "code",
      label: "Code",
    },

    {
      key: "isPaid",
      label: "Paid",
      render: (row) =>
        row.isPaid ? "Yes" : "No",
    },

    {
      key: "requiresApproval",
      label: "Approval",
      render: (row) =>
        row.requiresApproval
          ? "Required"
          : "Not Required",
    },

    {
      key: "isActive",
      label: "Status",
      render: (row) =>
        row.isActive
          ? "Active"
          : "Inactive",
    },
  ];

  // ==========================================
  // TABLE ROWS
  // ==========================================

  const rows = timeOffTypes.map((type) => ({
    ...type,
    id: type._id,
  }));

  // ==========================================
  // UI
  // ==========================================

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">
            Time Off Types
          </div>

          <div className="page-subtitle">
            Defines how each leave type behaves
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm((prev) => !prev);
            setFormError("");
            setSuccessMessage("");
          }}
        >
          {showForm
            ? "Cancel"
            : "New Time Off Type"}
        </button>
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
      {/* CREATE FORM */}
      {/* ====================================== */}

      {showForm && (
        <div
          className="card"
          style={{ marginBottom: 20 }}
        >
          <div className="section-title">
            New Time Off Type
          </div>

          {formError && (
            <div
              className="card"
              style={{
                marginTop: 15,
                marginBottom: 15,
                color: "var(--danger)",
              }}
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleCreate}>
            {/* NAME + CODE */}

            <div className="grid-2">
              <div>
                <label className="form-label">
                  Name
                </label>

                <input
                  className="form-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Casual Leave"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Code
                </label>

                <input
                  className="form-input"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="CL"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div
              style={{ marginTop: 15 }}
            >
              <label className="form-label">
                Description
              </label>

              <textarea
                className="form-input"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows={3}
              />
            </div>

            {/* OPTIONS */}

            <div
              style={{
                display: "flex",
                gap: 25,
                marginTop: 18,
              }}
            >
              <label>
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={form.isPaid}
                  onChange={handleChange}
                />{" "}
                Paid Leave
              </label>

              <label>
                <input
                  type="checkbox"
                  name="requiresApproval"
                  checked={
                    form.requiresApproval
                  }
                  onChange={handleChange}
                />{" "}
                Requires Approval
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />{" "}
                Active
              </label>
            </div>

            {/* SUBMIT */}

            <div
              style={{ marginTop: 20 }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Type"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ====================================== */}
      {/* LOAD ERROR */}
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
          <div style={{ padding: 20 }}>
            Loading time off types...
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: "var(--text-dim)",
            }}
          >
            No time off types found.
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
          />
        )}
      </div>
    </Layout>
  );
}