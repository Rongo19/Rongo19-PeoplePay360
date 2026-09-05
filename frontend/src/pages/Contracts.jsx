import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

import {
  getContracts,
  createContract,
} from "../api/contractApi";

import { getEmployees } from "../api/employeeApi";
import { getStructures } from "../api/salaryApi";
import { getSchedules } from "../api/scheduleApi";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    employee: "",
    contractNumber: "",
    contractType: "FULL_TIME",
    startDate: "",
    endDate: "",
    salaryStructure: "",
    workingSchedule: "",
    notes: "",
  });

  const navigate = useNavigate();

  // =========================================================
  // FETCH CONTRACTS
  // =========================================================

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getContracts();

      console.log(
        "CONTRACT API RESPONSE:",
        response.data
      );

      const data = response.data?.data;

      const contractList = Array.isArray(data)
        ? data
        : data?.contracts || [];

      console.log(
        "CONTRACT LIST:",
        contractList
      );

      const mappedContracts = contractList.map(
        (contract) => ({
          id: contract._id,

          reference:
            contract.contractNumber || "-",

          employeeName: contract.employee
            ? `${contract.employee.firstName || ""} ${
                contract.employee.lastName || ""
              }`.trim()
            : "-",

          contractType:
            contract.contractType || "-",

          startDate: contract.startDate
            ? new Date(
                contract.startDate
              ).toLocaleDateString()
            : "-",

          endDate: contract.endDate
            ? new Date(
                contract.endDate
              ).toLocaleDateString()
            : "Present",

          status:
            contract.status || "-",

          salaryStructure:
            contract.salaryStructure,

          workingSchedule:
            contract.workingSchedule,

          notes: contract.notes,
        })
      );

      setContracts(mappedContracts);
    } catch (error) {
      console.error(
        "CONTRACTS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load contracts."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH EMPLOYEES / SALARY STRUCTURES / SCHEDULES
  // =========================================================

  const fetchFormData = async () => {
    try {
      console.log(
        "Loading contract form data..."
      );

      const [
        employeesResponse,
        structuresResponse,
        schedulesResponse,
      ] = await Promise.all([
        getEmployees(),
        getStructures(),
        getSchedules(),
      ]);

      console.log(
        "EMPLOYEES RESPONSE:",
        employeesResponse.data
      );

      console.log(
        "SALARY STRUCTURES RESPONSE:",
        structuresResponse.data
      );

      console.log(
        "SCHEDULES RESPONSE:",
        schedulesResponse.data
      );

      // -------------------------
      // Employees
      // -------------------------

      const employeesData =
        employeesResponse.data?.data;

      const employeeList = Array.isArray(
        employeesData
      )
        ? employeesData
        : employeesData?.employees || [];

      setEmployees(employeeList);

      // -------------------------
      // Salary Structures
      // -------------------------

      const structuresData =
        structuresResponse.data?.data;

      const structureList = Array.isArray(
        structuresData
      )
        ? structuresData
        : structuresData?.structures || [];

      setSalaryStructures(structureList);

      // -------------------------
      // Working Schedules
      // -------------------------

      const schedulesData =
        schedulesResponse.data?.data;

      const scheduleList = Array.isArray(
        schedulesData
      )
        ? schedulesData
        : schedulesData?.schedules || [];

      setSchedules(scheduleList);

      console.log(
        "EMPLOYEE LIST:",
        employeeList
      );

      console.log(
        "SALARY STRUCTURE LIST:",
        structureList
      );

      console.log(
        "SCHEDULE LIST:",
        scheduleList
      );
    } catch (error) {
      console.error(
        "CONTRACT FORM DATA ERROR:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Failed to load contract form data."
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchContracts();
    fetchFormData();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleFormChange = (field, value) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setFormError("");
  };

  // =========================================================
  // CREATE CONTRACT
  // =========================================================

  const handleCreateContract = async () => {
    setFormError("");

    // -------------------------
    // Basic validation
    // -------------------------

    if (!form.employee) {
      setFormError(
        "Please select an employee."
      );
      return;
    }

    if (!form.contractNumber.trim()) {
      setFormError(
        "Please enter a contract number."
      );
      return;
    }

    if (!form.startDate) {
      setFormError(
        "Please select a start date."
      );
      return;
    }

    if (!form.salaryStructure) {
      setFormError(
        "Please select a salary structure."
      );
      return;
    }

    // -------------------------
    // Prepare request
    // -------------------------

    const contractData = {
      employee: form.employee,

      contractNumber:
        form.contractNumber.trim(),

      contractType:
        form.contractType,

      startDate:
        form.startDate,

      salaryStructure:
        form.salaryStructure,

      notes:
        form.notes.trim(),
    };

    // Only send endDate if selected
    if (form.endDate) {
      contractData.endDate =
        form.endDate;
    }

    // Only send schedule if selected
    if (form.workingSchedule) {
      contractData.workingSchedule =
        form.workingSchedule;
    }

    console.log(
      "CREATING CONTRACT:",
      contractData
    );

    try {
      setCreating(true);

      const response =
        await createContract(
          contractData
        );

      console.log(
        "CONTRACT CREATED:",
        response.data
      );

      // -------------------------
      // Reset form
      // -------------------------

      setForm({
        employee: "",
        contractNumber: "",
        contractType: "FULL_TIME",
        startDate: "",
        endDate: "",
        salaryStructure: "",
        workingSchedule: "",
        notes: "",
      });

      // Close form
      setShowForm(false);

      // Refresh contract list
      await fetchContracts();
    } catch (error) {
      console.error(
        "CREATE CONTRACT ERROR:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Failed to create contract."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // FILTER CONTRACTS
  // =========================================================

  const filteredContracts =
    contracts.filter((contract) =>
      contract.employeeName
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      key: "reference",
      label: "Reference",
    },

    {
      key: "employeeName",
      label: "Employee",
    },

    {
      key: "contractType",
      label: "Contract Type",
    },

    {
      key: "startDate",
      label: "Start Date",
    },

    {
      key: "endDate",
      label: "End Date",
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

  // =========================================================
  // UI
  // =========================================================

  return (
    <Layout>
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="page-header">
        <div>
          <div className="page-title">
            Contracts
          </div>

          <div className="page-subtitle">
            List view of employee contracts
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search contracts..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setFormError("");
              setError("");
            }}
          >
            New Contract
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* NEW CONTRACT FORM */}
      {/* ================================================= */}

      {showForm && (
        <div
          className="card"
          style={{
            marginBottom: 16,
          }}
        >
          <div className="section-title">
            New Contract
          </div>

          <div className="form-grid">

            {/* ----------------------------------------- */}
            {/* EMPLOYEE */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                Employee
              </label>

              <select
                value={form.employee}
                onChange={(e) =>
                  handleFormChange(
                    "employee",
                    e.target.value
                  )
                }
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
                      {
                        employee.firstName
                      }{" "}
                      {
                        employee.lastName
                      }{" "}
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

            {/* ----------------------------------------- */}
            {/* CONTRACT NUMBER */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                Contract Number
              </label>

              <input
                type="text"
                placeholder="CONT-EMP002-2026"
                value={
                  form.contractNumber
                }
                onChange={(e) =>
                  handleFormChange(
                    "contractNumber",
                    e.target.value
                  )
                }
              />
            </div>

            {/* ----------------------------------------- */}
            {/* CONTRACT TYPE */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                Contract Type
              </label>

              <select
                value={
                  form.contractType
                }
                onChange={(e) =>
                  handleFormChange(
                    "contractType",
                    e.target.value
                  )
                }
              >
                <option value="FULL_TIME">
                  Full Time
                </option>

                <option value="PART_TIME">
                  Part Time
                </option>

                <option value="CONTRACT">
                  Contract
                </option>

                <option value="TEMPORARY">
                  Temporary
                </option>

                <option value="INTERN">
                  Intern
                </option>
              </select>
            </div>

            {/* ----------------------------------------- */}
            {/* START DATE */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                Start Date
              </label>

              <input
                type="date"
                value={
                  form.startDate
                }
                onChange={(e) =>
                  handleFormChange(
                    "startDate",
                    e.target.value
                  )
                }
              />
            </div>

            {/* ----------------------------------------- */}
            {/* END DATE */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                End Date
              </label>

              <input
                type="date"
                value={
                  form.endDate
                }
                onChange={(e) =>
                  handleFormChange(
                    "endDate",
                    e.target.value
                  )
                }
              />

              <small>
                Leave empty for an ongoing
                contract.
              </small>
            </div>

            {/* ----------------------------------------- */}
            {/* SALARY STRUCTURE */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                Salary Structure
              </label>

              <select
                value={
                  form.salaryStructure
                }
                onChange={(e) =>
                  handleFormChange(
                    "salaryStructure",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select salary structure
                </option>

                {salaryStructures.map(
                  (structure) => (
                    <option
                      key={
                        structure._id
                      }
                      value={
                        structure._id
                      }
                    >
                      {
                        structure.name
                      }{" "}
                      (
                      {
                        structure.code
                      }
                      )
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ----------------------------------------- */}
            {/* WORKING SCHEDULE */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                Working Schedule
              </label>

              <select
                value={
                  form.workingSchedule
                }
                onChange={(e) =>
                  handleFormChange(
                    "workingSchedule",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select working schedule
                </option>

                {schedules.map(
                  (schedule) => (
                    <option
                      key={
                        schedule._id
                      }
                      value={
                        schedule._id
                      }
                    >
                      {
                        schedule.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ----------------------------------------- */}
            {/* NOTES */}
            {/* ----------------------------------------- */}

            <div className="field">
              <label>
                Notes
              </label>

              <input
                type="text"
                placeholder="Optional notes"
                value={
                  form.notes
                }
                onChange={(e) =>
                  handleFormChange(
                    "notes",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* ================================================= */}
          {/* FORM ERROR */}
          {/* ================================================= */}

          {formError && (
            <div
              className="login-error"
              style={{
                marginTop: 16,
              }}
            >
              {formError}
            </div>
          )}

          {/* ================================================= */}
          {/* FORM BUTTONS */}
          {/* ================================================= */}

          <div
            className="toolbar"
            style={{
              marginTop: 18,
            }}
          >
            <button
              className="btn btn-primary"
              onClick={
                handleCreateContract
              }
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Contract"}
            </button>

            <button
              className="btn"
              onClick={() => {
                setShowForm(false);
                setFormError("");
              }}
              disabled={creating}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* PAGE ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="card">
          <div className="login-error">
            {error}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loading && (
        <div className="card">
          Loading contracts...
        </div>
      )}

      {/* ================================================= */}
      {/* CONTRACT TABLE */}
      {/* ================================================= */}

      {!loading && !error && (
        <div className="card">
          <DataTable
            columns={columns}
            rows={filteredContracts}
            onRowClick={(row) =>
              navigate(
                `/contracts/${row.id}`
              )
            }
          />
        </div>
      )}
    </Layout>
  );
}