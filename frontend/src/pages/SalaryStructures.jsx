import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { salaryStructures } from "../data/mockData";

export default function SalaryStructures() {
  const navigate = useNavigate();

  const columns = [
    { key: "name", label: "Salary Structure" },
    { key: "type", label: "Type" },
    { key: "country", label: "Country" },
    { key: "employees", label: "Employees" },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Salary Structures</div>
          <div className="page-subtitle">Contains the rules used to calculate salary</div>
        </div>
        <button className="btn btn-primary">New Structure</button>
      </div>
      <div className="card">
        <DataTable
          columns={columns}
          rows={salaryStructures}
          onRowClick={(row) => navigate(`/payroll/structures/${row.id}`)}
        />
      </div>
    </Layout>
  );
}
