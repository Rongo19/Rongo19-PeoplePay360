import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

import {
  getAllocations,
  createAllocation,
  getTimeOffTypes,
} from "../api/timeoffApi";

import { getEmployees } from "../api/employeeApi";

export default function Allocations() {
  const navigate = useNavigate();

  // ==========================================
  // LIST STATE
  // ==========================================

  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [timeOffTypes, setTimeOffTypes] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FORM STATE
  // ==========================================

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    timeOffTypeId: "",
    year: new Date().getFullYear(),
    allocatedDays: "",
    carriedForwardDays: "",
    adjustmentDays: "",
    notes: "",
  });

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadAllocations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllocations();

      setAllocations(response.data?.data || []);
    } catch (err) {
      console.error("Failed to load allocations:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load allocations"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
  try {
    const [employeeResponse, typeResponse] = await Promise.all([
      getEmployees(),
      getTimeOffTypes(),
    ]);

    const employeeData = employeeResponse.data?.data;
    const typeData = typeResponse.data?.data;

    setEmployees(
      Array.isArray(employeeData)
        ? employeeData
        : employeeData?.employees || []
    );

    setTimeOffTypes(
      Array.isArray(typeData)
        ? typeData
        : typeData?.types || []
    );
  } catch (err) {
    console.error(
      "Failed to load allocation form data:",
      err
    );

    setError(
      err.response?.data?.message ||
        "Failed to load employees or time off types"
    );
  }
};

  useEffect(() => {
    loadAllocations();
    loadFormData();
  }, []);

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      employeeId: "",
      timeOffTypeId: "",
      year: new Date().getFullYear(),
      allocatedDays: "",
      carriedForwardDays: "",
      adjustmentDays: "",
      notes: "",
    });
  };

  const handleOpenForm = () => {
    setError("");
    setSuccess("");
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (formLoading) return;

    setShowForm(false);
    resetForm();
    setError("");
  };

  // ==========================================
  // CREATE ALLOCATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic frontend validation
    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!form.timeOffTypeId) {
      setError("Please select a time off type.");
      return;
    }

    if (!form.year) {
      setError("Please enter a year.");
      return;
    }

    if (
      form.allocatedDays === "" ||
      Number(form.allocatedDays) < 0
    ) {
      setError(
        "Allocated days must be 0 or greater."
      );
      return;
    }

    try {
      setFormLoading(true);

      const payload = {
        employeeId: form.employeeId,
        timeOffTypeId: form.timeOffTypeId,
        year: Number(form.year),
        allocatedDays: Number(form.allocatedDays),
        carriedForwardDays:
          form.carriedForwardDays === ""
            ? 0
            : Number(form.carriedForwardDays),
        adjustmentDays:
          form.adjustmentDays === ""
            ? 0
            : Number(form.adjustmentDays),
        notes: form.notes.trim() || null,
      };

      console.log(
        "Creating allocation:",
        payload
      );

      await createAllocation(payload);

      setSuccess(
        "Time off allocation created successfully."
      );

      setShowForm(false);
      resetForm();

      await loadAllocations();
    } catch (err) {
      console.error(
        "Failed to create allocation:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to create allocation"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const rows = useMemo(() => {
    const query = search.toLowerCase().trim();

    return allocations
      .map((allocation) => {
        const employee = allocation.employee;

        const employeeName = employee
          ? `${employee.firstName || ""} ${
              employee.lastName || ""
            }`.trim()
          : "-";

        const typeName =
          allocation.timeOffType?.name || "-";

        const allocated =
          Number(allocation.allocatedDays || 0);

        const carriedForward =
          Number(
            allocation.carriedForwardDays || 0
          );

        const adjustment =
          Number(
            allocation.adjustmentDays || 0
          );

        const totalAllocated =
          allocated +
          carriedForward +
          adjustment;

        return {
          ...allocation,

          id: allocation._id,

          employeeName,

          type: typeName,

          allocated: totalAllocated,

          taken: 0,

          remaining: totalAllocated,
        };
      })
      .filter((allocation) => {
        if (!query) return true;

        return (
          allocation.employeeName
            .toLowerCase()
            .includes(query) ||
          allocation.type
            .toLowerCase()
            .includes(query)
        );
      });
  }, [allocations, search]);

  // ==========================================
  // TABLE
  // ==========================================

  const columns = [
    {
      key: "employeeName",
      label: "Employee",
    },
    {
      key: "type",
      label: "Time Off Type",
    },
    {
      key: "year",
      label: "Year",
    },
    {
      key: "allocated",
      label: "Allocated",
    },
    {
      key: "taken",
      label: "Taken",
    },
    {
      key: "remaining",
      label: "Remaining",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          status={row.status || "ACTIVE"}
        />
      ),
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">
            Allocations
          </div>

          <div className="page-subtitle">
            Manage employee time off allocations
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search allocations..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenForm}
          >
            New Allocation
          </button>
        </div>
      </div>

      {/* ========================================
          SUCCESS MESSAGE
      ======================================== */}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* ========================================
          ERROR MESSAGE
      ======================================== */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* ========================================
          CREATE FORM
      ======================================== */}

      {showForm && (
        <div className="card">
          <div className="page-header">
            <div>
              <div className="section-title">
                Create New Allocation
              </div>

              <div className="page-subtitle">
                Assign time off balance to an
                employee
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* Employee */}

              <div className="field">
                <label htmlFor="employeeId">
                  Employee *
                </label>

                <select
                  id="employeeId"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.employeeCode} —{" "}
                      {employee.firstName}{" "}
                      {employee.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Off Type */}

              <div className="field">
                <label htmlFor="timeOffTypeId">
                  Time Off Type *
                </label>

                <select
                  id="timeOffTypeId"
                  name="timeOffTypeId"
                  value={form.timeOffTypeId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select time off type
                  </option>

                  {timeOffTypes.map((type) => (
                    <option
                      key={type._id}
                      value={type._id}
                    >
                      {type.name} ({type.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}

              <div className="field">
                <label htmlFor="year">
                  Year *
                </label>

                <input
                  id="year"
                  name="year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={form.year}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Allocated Days */}

              <div className="field">
                <label htmlFor="allocatedDays">
                  Allocated Days *
                </label>

                <input
                  id="allocatedDays"
                  name="allocatedDays"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 12"
                  value={form.allocatedDays}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Carried Forward */}

              <div className="field">
                <label htmlFor="carriedForwardDays">
                  Carried Forward Days
                </label>

                <input
                  id="carriedForwardDays"
                  name="carriedForwardDays"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={
                    form.carriedForwardDays
                  }
                  onChange={handleChange}
                />
              </div>

              {/* Adjustment */}

              <div className="field">
                <label htmlFor="adjustmentDays">
                  Adjustment Days
                </label>

                <input
                  id="adjustmentDays"
                  name="adjustmentDays"
                  type="number"
                  step="0.5"
                  placeholder="0"
                  value={form.adjustmentDays}
                  onChange={handleChange}
                />
              </div>

              {/* Notes */}

              <div
                className="field"
                style={{
                  gridColumn:
                    "1 / -1",
                }}
              >
                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  maxLength="500"
                  placeholder="Optional notes..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Buttons */}

            <div
              className="toolbar"
              style={{
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={handleCloseForm}
                disabled={formLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={formLoading}
              >
                {formLoading
                  ? "Creating..."
                  : "Create Allocation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================
          TABLE
      ======================================== */}

      <div className="card">
        {loading ? (
          <div className="empty-state">
            Loading allocations...
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            onRowClick={(row) =>
              navigate(
                `/allocations/${row.id}`
              )
            }
          />
        )}
      </div>
    </Layout>
  );
}