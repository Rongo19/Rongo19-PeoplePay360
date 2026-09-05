import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import {
  getEmployees,
  createEmployee,
} from "../api/employeeApi";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    department: "",
    manager: "",
    workLocation: "",
    email: "",
    employeeCode: "",
    dateOfJoining: "",
  });

  const navigate = useNavigate();

  const fetchEmployees = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await getEmployees();

    console.log("EMPLOYEE API RESPONSE:", response.data);

    const data = response.data?.data;

    // Handle either:
    // { data: [...] }
    // OR
    // { data: { employees: [...] } }
    const employeeList = Array.isArray(data)
      ? data
      : data?.employees || [];

    console.log("EMPLOYEE LIST:", employeeList);

    const mappedEmployees = employeeList.map((employee) => ({
      id: employee._id,
      name: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
      jobPosition: employee.designation || "-",
      department: employee.department || "-",
      manager:
        employee.manager?.firstName
          ? `${employee.manager.firstName} ${
              employee.manager.lastName || ""
            }`
          : "-",
      workLocation: employee.address?.city || "-",
      status: employee.employmentStatus || "ACTIVE",
      email: employee.email,
      employeeCode: employee.employeeCode,
    }));

    setEmployees(mappedEmployees);
  } catch (error) {
    console.error("EMPLOYEES ERROR:", error);

    setError(
      error.response?.data?.message ||
        "Failed to load employees."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchEmployees();
}, []);

  // -----------------------------
  // LOAD EMPLOYEES
  // -----------------------------
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEmployees();

        console.log("EMPLOYEE API FULL RESPONSE:", response);
        console.log("EMPLOYEE API DATA:", response.data);
        console.log(
          "EMPLOYEE API DATA.DATA:",
          response.data?.data
        );

        console.log("EMPLOYEES RESPONSE:", response.data);

        const backendEmployees = response.data.data;

        const mappedEmployees = backendEmployees.map((employee) => ({
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          jobPosition: employee.designation || "-",
          department: employee.department || "-",
          manager: employee.manager || "-",
          workLocation: employee.address?.city || "-",
          status: employee.employmentStatus || "ACTIVE",
        }));

        setEmployees(mappedEmployees);
      } catch (error) {
        console.error("EMPLOYEES ERROR:", error);

        setError(
          error.response?.data?.message ||
            ""
        );
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // -----------------------------
  // SEARCH
  // -----------------------------
  const filtered = employees.filter((employee) =>
    employee.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = [
    { key: "name", label: "Employee" },
    { key: "jobPosition", label: "Job Position" },
    { key: "department", label: "Department" },
    { key: "manager", label: "Manager" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
  ];

  // -----------------------------
  // FORM INPUT
  // -----------------------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // -----------------------------
  // CREATE EMPLOYEE
  // -----------------------------
  const handleAddEmployee = async () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.employeeCode.trim() ||
      !form.department.trim() ||
      !form.designation.trim() ||
      !form.dateOfJoining
    ) {
      setError(
        "Please fill all required employee fields."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const employeeData = {
        employeeCode: form.employeeCode,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        DOB: form.DOB,
        Gender: form.Gender,
        department: form.department,
        designation: form.designation,
        dateOfJoining: form.dateOfJoining,
      };

      console.log(
        "CREATING EMPLOYEE:",
        employeeData
      );

      const response = await createEmployee(
        employeeData
      );

      console.log(
        "CREATE EMPLOYEE RESPONSE:",
        response.data
      );

      const employee = response.data.data;

      const newEmployee = {
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`,
        jobPosition: employee.designation || "-",
        department: employee.department || "-",
        manager: employee.manager || "-",
        phone: employee.phone || "-",
        DOB: employee.DOB || "-",
        Gender: employee.Gender || "-",
        workLocation:
          employee.address?.city || "-",
        status:
          employee.employmentStatus || "ACTIVE",
      };

      setEmployees((previous) => [
        ...previous,
        newEmployee,
      ]);

      setForm({
        firstName: "",
        lastName: "",
        designation: "",
        department: "",
        manager: "",
        workLocation: "",
        email: "",
        employeeCode: "",
        dateOfJoining: "",
        phone: "",
        DOB: "",
        Gender: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error(
        "CREATE EMPLOYEE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create employee"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">
            Employees
          </div>

          <div className="page-subtitle">
            Search or manage employee records
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
            className="btn btn-sm"
            onClick={() =>
              setView(
                view === "list"
                  ? "kanban"
                  : "list"
              )
            }
          >
            {view === "list"
              ? "Kanban View"
              : "List View"}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            New Employee
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="login-error"
          style={{ marginBottom: 16 }}
        >
          {error}
        </div>
      )}

      {/* NEW EMPLOYEE FORM */}
      {showForm && (
        <div
          className="card"
          style={{ marginBottom: 16 }}
        >
          <div className="section-title">
            New Employee
          </div>

          <div className="form-grid">

            <div className="field">
              <label>First Name *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Last Name *</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Employee Code *</label>
              <input
                name="employeeCode"
                value={form.employeeCode}
                onChange={handleChange}
                placeholder="EMP002"
              />
            </div>

            <div className="field">
              <label>Job Position *</label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Department *</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Manager</label>
              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Work Location</label>
              <input
                name="workLocation"
                value={form.workLocation}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Date of Joining *</label>
              <input
                type="date"
                name="dateOfJoining"
                value={form.dateOfJoining}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Date of Birth</label>
              <input
                type="date"
                name="DOB"
                value={form.DOB}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Gender</label>
              <select
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            

          </div>

          <div
            className="toolbar"
            style={{ marginTop: 18 }}
          >
            <button
              className="btn btn-primary"
              onClick={handleAddEmployee}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save"}
            </button>

            <button
              className="btn"
              onClick={() =>
                setShowForm(false)
              }
              disabled={saving}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="card">
          Loading employees...
        </div>
      ) : view === "list" ? (
        <div className="card">
          <DataTable
            columns={columns}
            rows={filtered}
            onRowClick={(row) =>
              navigate(
                `/employees/${row.id}`
              )
            }
          />
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/employees/${emp.id}`
                )
              }
            >
              <div className="record-header">
                <div className="avatar">
                  {emp.name.charAt(0)}
                </div>

                <div>
                  <h2>{emp.name}</h2>
                  <p>
                    {emp.jobPosition}
                  </p>
                </div>
              </div>

              <StatusBadge
                status={emp.status}
              />
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}