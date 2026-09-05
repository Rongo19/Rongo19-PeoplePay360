import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { salaryRules } from "../data/mockData";

export default function SalaryRules() {
  const navigate = useNavigate();

  const columns = [
    { key: "sequence", label: "Sequence" },
    { key: "code", label: "Code" },
    { key: "name", label: "Rule Name" },
    { key: "category", label: "Category" },
    { key: "computation", label: "Computation Method" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Salary Rules</div>
          <div className="page-subtitle">Rules are processed according to their sequence</div>
        </div>
        <button className="btn btn-primary">New Rule</button>
      </div>
      <div className="card">
        <DataTable columns={columns} rows={salaryRules} onRowClick={(row) => navigate(`/payroll/rules/${row.id}`)} />
      </div>
    </Layout>
  );
}
