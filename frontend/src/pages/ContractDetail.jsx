import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { contracts, findEmployee } from "../data/mockData";

export default function ContractDetail() {
  const { id } = useParams();
  const contract = contracts.find((c) => String(c.id) === String(id));

  if (!contract) {
    return (
      <Layout>
        <div className="empty-state">Contract not found.</div>
      </Layout>
    );
  }

  const employee = findEmployee(contract.employeeId);

  return (
    <Layout>
      <Link to="/contracts" className="back-link">
        ← Back to Contracts
      </Link>
      <div className="page-header">
        <div>
          <div className="page-title">Contract / {contract.reference}</div>
          <div className="page-subtitle">Full view of one contract</div>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      <div className="card">
        <div className="form-grid">
          <div className="field">
            <label>Employee</label>
            <input readOnly value={employee?.name || "-"} />
          </div>
          <div className="field">
            <label>Job Position</label>
            <input readOnly value={contract.jobPosition} />
          </div>
          <div className="field">
            <label>Department</label>
            <input readOnly value={employee?.department || "-"} />
          </div>
          <div className="field">
            <label>Wage</label>
            <input readOnly value={`₹ ${contract.wage.toLocaleString()}`} />
          </div>
          <div className="field">
            <label>Start Date</label>
            <input readOnly value={contract.startDate} />
          </div>
          <div className="field">
            <label>End Date</label>
            <input readOnly value={contract.endDate} />
          </div>
          <div className="field">
            <label>Working Schedule</label>
            <input readOnly value="40 hours / week" />
          </div>
          <div className="field">
            <label>Salary Structure</label>
            <input readOnly value="Regular Salary" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
