import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { salaryStructures, salaryRules } from "../data/mockData";

export default function SalaryStructureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const structure = salaryStructures.find((s) => String(s.id) === String(id));

  if (!structure) {
    return (
      <Layout>
        <div className="empty-state">Salary structure not found.</div>
      </Layout>
    );
  }

  const rules = salaryRules.filter((r) => r.structureId === structure.id);

  const columns = [
    { key: "sequence", label: "Sequence" },
    { key: "code", label: "Code" },
    { key: "name", label: "Rule Name" },
    { key: "category", label: "Category" },
    { key: "computation", label: "Computation Method" },
  ];

  return (
    <Layout>
      <Link to="/payroll/structures" className="back-link">
        ← Back to Salary Structures
      </Link>
      <div className="page-header">
        <div>
          <div className="page-title">Salary Structure / {structure.name}</div>
          <div className="page-subtitle">
            {structure.type} · {structure.country} · {structure.employees} employees
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Salary Rules</div>
        <DataTable columns={columns} rows={rules} onRowClick={(row) => navigate(`/payroll/rules/${row.id}`)} />
      </div>
    </Layout>
  );
}
