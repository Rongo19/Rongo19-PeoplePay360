import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { salaryRules, salaryStructures } from "../data/mockData";

export default function SalaryRuleDetail() {
  const { id } = useParams();
  const rule = salaryRules.find((r) => String(r.id) === String(id));

  if (!rule) {
    return (
      <Layout>
        <div className="empty-state">Salary rule not found.</div>
      </Layout>
    );
  }

  const structure = salaryStructures.find((s) => s.id === rule.structureId);

  return (
    <Layout>
      <Link to="/payroll/rules" className="back-link">
        ← Back to Salary Rules
      </Link>
      <div className="page-header">
        <div>
          <div className="page-title">Salary Rule / {rule.name}</div>
          <div className="page-subtitle">Part of {structure?.name || "-"}</div>
        </div>
      </div>

      <div className="card">
        <div className="form-grid">
          <div className="field">
            <label>Code</label>
            <input readOnly value={rule.code} />
          </div>
          <div className="field">
            <label>Name</label>
            <input readOnly value={rule.name} />
          </div>
          <div className="field">
            <label>Category</label>
            <input readOnly value={rule.category} />
          </div>
          <div className="field">
            <label>Sequence</label>
            <input readOnly value={rule.sequence} />
          </div>
          <div className="field">
            <label>Salary Structure</label>
            <input readOnly value={structure?.name || "-"} />
          </div>
          <div className="field">
            <label>Computation Method</label>
            <input readOnly value={rule.computation} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
