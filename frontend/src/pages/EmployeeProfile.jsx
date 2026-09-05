import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import {
  findEmployee,
  contracts,
  attendances,
  timeOffRequests,
} from "../data/mockData";

const TABS = ["Contracts", "Time Off", "Attendance"];

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employee = findEmployee(id);
  const [tab, setTab] = useState("Contracts");

  if (!employee) {
    return (
      <Layout>
        <div className="empty-state">Employee not found.</div>
      </Layout>
    );
  }

  const empContracts = contracts.filter((c) => c.employeeId === employee.id);
  const empAttendance = attendances.filter((a) => a.employeeId === employee.id);
  const empTimeOff = timeOffRequests.filter((t) => t.employeeId === employee.id);

  return (
    <Layout>
      <Link to="/employees" className="back-link">
        ← Back to Employees
      </Link>

      <div className="record-header">
        <div className="avatar">{employee.name.charAt(0)}</div>
        <div>
          <h2>{employee.name}</h2>
          <p>{employee.jobPosition} · {employee.department}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 18 }}>
        <div className="card">
          <div className="section-title">Manager</div>
          {employee.manager}
        </div>
        <div className="card">
          <div className="section-title">Work Location</div>
          {employee.workLocation}
        </div>
        <div className="card">
          <div className="section-title">Status</div>
          <StatusBadge status={employee.status} />
        </div>
      </div>

      <div className="tabbar">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === "Contracts" && (
          <DataTable
            columns={[
              { key: "reference", label: "Reference" },
              { key: "startDate", label: "Start Date" },
              { key: "wage", label: "Wage", render: (r) => `₹ ${r.wage.toLocaleString()}` },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={empContracts}
            onRowClick={(row) => navigate(`/contracts/${row.id}`)}
          />
        )}
        {tab === "Attendance" && (
          <DataTable
            columns={[
              { key: "date", label: "Date" },
              { key: "checkIn", label: "Check In" },
              { key: "checkOut", label: "Check Out" },
              { key: "worked", label: "Worked Hours" },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={empAttendance}
            onRowClick={(row) => navigate(`/attendance/${row.id}`)}
          />
        )}
        {tab === "Time Off" && (
          <DataTable
            columns={[
              { key: "type", label: "Time Off Type" },
              { key: "start", label: "Start" },
              { key: "end", label: "End" },
              { key: "duration", label: "Duration" },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={empTimeOff}
            onRowClick={(row) => navigate(`/timeoff/${row.id}`)}
          />
        )}
      </div>
    </Layout>
  );
}
