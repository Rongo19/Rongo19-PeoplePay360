import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";

import { getEmployee } from "../api/employeeApi";
import { getContracts } from "../api/contractApi";
import { getAttendance } from "../api/attendanceApi";
import { getTimeOffRequests } from "../api/timeoffApi";

const TABS = ["Contracts", "Time Off", "Attendance"];

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timeOff, setTimeOff] = useState([]);

  const [tab, setTab] = useState("Contracts");

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH EMPLOYEE
  // ==========================================

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEmployee(id);

        setEmployee(response.data.data);
      } catch (err) {
        console.error("Failed to fetch employee:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load employee details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id]);

  // ==========================================
  // FETCH TAB DATA
  // ==========================================

  useEffect(() => {
    if (!id) return;

    const fetchTabData = async () => {
      try {
        setTabLoading(true);

        if (tab === "Contracts") {
          const response = await getContracts({
            employeeId: id,
          });

          setContracts(response.data.data || []);
        }

        if (tab === "Attendance") {
          const response = await getAttendance({
            employeeId: id,
          });

          setAttendance(response.data.data || []);
        }

        if (tab === "Time Off") {
          const response = await getTimeOffRequests({
            employeeId: id,
          });

          setTimeOff(response.data.data || []);
        }
      } catch (err) {
        console.error(`Failed to fetch ${tab}:`, err);
      } finally {
        setTabLoading(false);
      }
    };

    fetchTabData();
  }, [id, tab]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <Layout>
        <div className="empty-state">
          Loading employee details...
        </div>
      </Layout>
    );
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (error || !employee) {
    return (
      <Layout>
        <div className="empty-state">
          {error || "Employee not found."}
        </div>
      </Layout>
    );
  }

  // ==========================================
  // EMPLOYEE DISPLAY DATA
  // ==========================================

  const fullName = `${employee.firstName || ""} ${
    employee.lastName || ""
  }`.trim();

  const initials =
    `${employee.firstName?.charAt(0) || ""}${
      employee.lastName?.charAt(0) || ""
    }`.toUpperCase();

  const managerName =
    employee.manager && typeof employee.manager === "object"
      ? `${employee.manager.firstName || ""} ${
          employee.manager.lastName || ""
        }`.trim()
      : employee.manager || "—";

  return (
    <Layout>
      {/* ==========================================
          BACK
      ========================================== */}

      <Link to="/employees" className="back-link">
        ← Back to Employees
      </Link>

      {/* ==========================================
          EMPLOYEE HEADER
      ========================================== */}

      <div className="record-header">
        <div className="avatar">
          {employee.profileImage ? (
            <img
              src={employee.profileImage}
              alt={fullName}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            initials || "?"
          )}
        </div>

        <div>
          <h2>{fullName}</h2>

          <p>
            {employee.designation || "—"} ·{" "}
            {employee.department || "—"}
          </p>

          <p style={{ marginTop: 4 }}>
            Employee Code:{" "}
            <strong>{employee.employeeCode}</strong>
          </p>
        </div>
      </div>

      {/* ==========================================
          BASIC INFORMATION
      ========================================== */}

      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Email</div>
          <div>{employee.email || "—"}</div>
        </div>

        <div className="card">
          <div className="section-title">Phone</div>
          <div>{employee.phone || "—"}</div>
        </div>

        <div className="card">
          <div className="section-title">Status</div>

          <StatusBadge
            status={employee.employmentStatus}
          />
        </div>
      </div>

      {/* ==========================================
          JOB INFORMATION
      ========================================== */}

      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Department</div>
          <div>{employee.department || "—"}</div>
        </div>

        <div className="card">
          <div className="section-title">Designation</div>
          <div>{employee.designation || "—"}</div>
        </div>

        <div className="card">
          <div className="section-title">Date of Joining</div>

          <div>
            {employee.dateOfJoining
              ? new Date(
                  employee.dateOfJoining
                ).toLocaleDateString()
              : "—"}
          </div>
        </div>
      </div>

      {/* ==========================================
          PERSONAL INFORMATION
      ========================================== */}

      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Manager</div>
          <div>{managerName}</div>
        </div>

        <div className="card">
          <div className="section-title">Gender</div>
          <div>{employee.gender || "—"}</div>
        </div>

        <div className="card">
          <div className="section-title">Date of Birth</div>

          <div>
            {employee.dateOfBirth
              ? new Date(
                  employee.dateOfBirth
                ).toLocaleDateString()
              : "—"}
          </div>
        </div>
      </div>

      {/* ==========================================
          ADDRESS
      ========================================== */}

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">Address</div>

        {employee.address ? (
          <div>
            {employee.address.street && (
              <div>{employee.address.street}</div>
            )}

            <div>
              {[
                employee.address.city,
                employee.address.state,
                employee.address.postalCode,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>

            {employee.address.country && (
              <div>{employee.address.country}</div>
            )}
          </div>
        ) : (
          "—"
        )}
      </div>

      {/* ==========================================
          TABS
      ========================================== */}

      <div className="tabbar">
        {TABS.map((tabName) => (
          <button
            key={tabName}
            className={tab === tabName ? "active" : ""}
            onClick={() => setTab(tabName)}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* ==========================================
          TAB CONTENT
      ========================================== */}

      <div className="card">
        {tabLoading ? (
          <div className="empty-state">
            Loading {tab.toLowerCase()}...
          </div>
        ) : (
          <>
            {/* ======================================
                CONTRACTS
            ====================================== */}

            {tab === "Contracts" && (
              <DataTable
                columns={[
                  {
                    key: "contractNumber",
                    label: "Reference",
                  },
                  {
                    key: "startDate",
                    label: "Start Date",
                    render: (row) =>
                      row.startDate
                        ? new Date(
                            row.startDate
                          ).toLocaleDateString()
                        : "—",
                  },
                  {
                    key: "contractType",
                    label: "Contract Type",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (row) => (
                      <StatusBadge status={row.status} />
                    ),
                  },
                ]}
                rows={contracts}
                onRowClick={(row) =>
                  navigate(`/contracts/${row._id}`)
                }
              />
            )}

            {/* ======================================
                ATTENDANCE
            ====================================== */}

            {tab === "Attendance" && (
              <DataTable
                columns={[
                  {
                    key: "date",
                    label: "Date",
                    render: (row) =>
                      row.date
                        ? new Date(
                            row.date
                          ).toLocaleDateString()
                        : "—",
                  },
                  {
                    key: "checkIn",
                    label: "Check In",
                    render: (row) =>
                      row.checkIn
                        ? new Date(
                            row.checkIn
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—",
                  },
                  {
                    key: "checkOut",
                    label: "Check Out",
                    render: (row) =>
                      row.checkOut
                        ? new Date(
                            row.checkOut
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—",
                  },
                  {
                    key: "workedHours",
                    label: "Worked Hours",
                    render: (row) =>
                      row.workedHours != null
                        ? `${row.workedHours} hrs`
                        : "—",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (row) => (
                      <StatusBadge status={row.status} />
                    ),
                  },
                ]}
                rows={attendance}
                onRowClick={(row) =>
                  navigate(`/attendance/${row._id}`)
                }
              />
            )}

            {/* ======================================
                TIME OFF
            ====================================== */}

            {tab === "Time Off" && (
              <DataTable
                columns={[
                  {
                    key: "type",
                    label: "Time Off Type",
                    render: (row) =>
                      row.timeOffType?.name ||
                      row.timeOffType?.code ||
                      "—",
                  },
                  {
                    key: "startDate",
                    label: "Start",
                    render: (row) =>
                      row.startDate
                        ? new Date(
                            row.startDate
                          ).toLocaleDateString()
                        : "—",
                  },
                  {
                    key: "endDate",
                    label: "End",
                    render: (row) =>
                      row.endDate
                        ? new Date(
                            row.endDate
                          ).toLocaleDateString()
                        : "—",
                  },
                  {
                    key: "requestedDays",
                    label: "Duration",
                    render: (row) =>
                      row.requestedDays != null
                        ? `${row.requestedDays} days`
                        : "—",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (row) => (
                      <StatusBadge status={row.status} />
                    ),
                  },
                ]}
                rows={timeOff}
                onRowClick={(row) =>
                  navigate(`/timeoff/${row._id}`)
                }
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}