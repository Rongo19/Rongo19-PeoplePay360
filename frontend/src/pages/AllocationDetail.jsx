import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { allocations, findEmployee } from "../data/mockData";

export default function AllocationDetail() {
  const { id } = useParams();
  const record = allocations.find((a) => String(a.id) === String(id));

  if (!record) {
    return (
      <Layout>
        <div className="empty-state">Allocation not found.</div>
      </Layout>
    );
  }

  const employee = findEmployee(record.employeeId);

  return (
    <Layout>
      <Link to="/allocations" className="back-link">
        ← Back to Allocations
      </Link>
      <div className="page-header">
        <div>
          <div className="page-title">Allocation / {employee?.name}</div>
          <div className="page-subtitle">One view of the allocation</div>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <div className="card">
        <div className="form-grid">
          <div className="field">
            <label>Employee</label>
            <input readOnly value={employee?.name || "-"} />
          </div>
          <div className="field">
            <label>Time Off Type</label>
            <input readOnly value={record.type} />
          </div>
          <div className="field">
            <label>Allocated</label>
            <input readOnly value={record.allocated} />
          </div>
          <div className="field">
            <label>Taken</label>
            <input readOnly value={record.taken} />
          </div>
          <div className="field">
            <label>Remaining</label>
            <input readOnly value={record.remaining} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
