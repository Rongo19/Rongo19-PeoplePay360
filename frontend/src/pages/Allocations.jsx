import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { allocations, findEmployee } from "../data/mockData";

export default function Allocations() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const rows = allocations
    .map((a) => ({ ...a, employeeName: findEmployee(a.employeeId)?.name || "-" }))
    .filter((a) => a.employeeName.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: "employeeName", label: "Employee" },
    { key: "type", label: "Time Off Type" },
    { key: "allocated", label: "Allocated" },
    { key: "taken", label: "Taken" },
    { key: "remaining", label: "Remaining" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Allocations</div>
          <div className="page-subtitle">Approved leave reduces the employee's available balance</div>
        </div>
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search allocations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary">New Allocation</button>
        </div>
      </div>
      <div className="card">
        <DataTable columns={columns} rows={rows} onRowClick={(row) => navigate(`/allocations/${row.id}`)} />
      </div>
    </Layout>
  );
}
