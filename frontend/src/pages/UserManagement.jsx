import { useState } from "react";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { users as initialUsers } from "../data/mockData";

const ROLES = ["Admin", "Payroll Admin", "HR User", "Employee"];

export default function UserManagement() {
  const [users] = useState(initialUsers);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) =>
    (u.name + u.email).toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", label: "User" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (row) => <span className="badge badge-blue">{row.role}</span>,
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Search or manage employees or users</div>
        </div>
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search employees or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setSelected({ id: null, name: "", email: "", role: "Employee" })}>
            New User
          </button>
        </div>
      </div>

      <div className={selected ? "grid-2" : ""}>
        <div className="card">
          <DataTable columns={columns} rows={filtered} onRowClick={(row) => setSelected(row)} />
        </div>

        {selected && (
          <div className="card">
            <div className="section-title">{selected.id ? "Edit User" : "Create User"}</div>
            <div className="form-grid">
              <div className="field">
                <label>Name</label>
                <input defaultValue={selected.name} placeholder="Full name" />
              </div>
              <div className="field">
                <label>Email</label>
                <input defaultValue={selected.email} placeholder="name@company.com" />
              </div>
              <div className="field">
                <label>Role</label>
                <select defaultValue={selected.role}>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select defaultValue="Active">
                  <option>Active</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>
            <div className="toolbar" style={{ marginTop: 18 }}>
              <button className="btn btn-primary">Save changes</button>
              <button className="btn" onClick={() => setSelected(null)}>
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
