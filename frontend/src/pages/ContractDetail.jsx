import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";

import { getContract } from "../api/contractApi";

export default function ContractDetail() {
  const { id } = useParams();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Fetching contract:", id);

        const response = await getContract(id);

        console.log("CONTRACT DETAIL API RESPONSE:", response.data);

        const data = response.data?.data;

        setContract(data);
      } catch (error) {
        console.error("CONTRACT DETAIL ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load contract details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContract();
    }
  }, [id]);

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

  if (loading) {
    return (
      <Layout>
        <div className="card">
          Loading contract details...
        </div>
      </Layout>
    );
  }

  // ---------------------------------------------
  // ERROR
  // ---------------------------------------------

  if (error) {
    return (
      <Layout>
        <Link to="/contracts" className="back-link">
          ← Back to Contracts
        </Link>

        <div className="card">
          <div className="login-error">{error}</div>
        </div>
      </Layout>
    );
  }

  // ---------------------------------------------
  // NOT FOUND
  // ---------------------------------------------

  if (!contract) {
    return (
      <Layout>
        <Link to="/contracts" className="back-link">
          ← Back to Contracts
        </Link>

        <div className="empty-state">
          Contract not found.
        </div>
      </Layout>
    );
  }

  // ---------------------------------------------
  // HELPER VALUES
  // ---------------------------------------------

  const employee = contract.employee;

  const employeeName = employee
    ? `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim()
    : "-";

  const employeeCode = employee?.employeeCode || "-";

  const department = employee?.department || "-";

  const salaryStructure =
    contract.salaryStructure;

  const workingSchedule =
    contract.workingSchedule;

  // ---------------------------------------------
  // UI
  // ---------------------------------------------

  return (
    <Layout>
      <Link to="/contracts" className="back-link">
        ← Back to Contracts
      </Link>

      <div className="page-header">
        <div>
          <div className="page-title">
            Contract /{" "}
            {contract.contractNumber || "-"}
          </div>

          <div className="page-subtitle">
            Full view of one contract
          </div>
        </div>

        <StatusBadge status={contract.status} />
      </div>

      {/* --------------------------------------- */}
      {/* CONTRACT DETAILS */}
      {/* --------------------------------------- */}

      <div className="card">
        <div className="section-title">
          Contract Details
        </div>

        <div className="form-grid">

          {/* Contract Number */}
          <div className="field">
            <label>Contract Number</label>

            <input
              readOnly
              value={
                contract.contractNumber || "-"
              }
            />
          </div>

          {/* Contract Type */}
          <div className="field">
            <label>Contract Type</label>

            <input
              readOnly
              value={
                contract.contractType || "-"
              }
            />
          </div>

          {/* Status */}
          <div className="field">
            <label>Status</label>

            <input
              readOnly
              value={
                contract.status || "-"
              }
            />
          </div>

          {/* Start Date */}
          <div className="field">
            <label>Start Date</label>

            <input
              readOnly
              value={
                contract.startDate
                  ? new Date(
                      contract.startDate
                    ).toLocaleDateString()
                  : "-"
              }
            />
          </div>

          {/* End Date */}
          <div className="field">
            <label>End Date</label>

            <input
              readOnly
              value={
                contract.endDate
                  ? new Date(
                      contract.endDate
                    ).toLocaleDateString()
                  : "Present"
              }
            />
          </div>

        </div>
      </div>

      {/* --------------------------------------- */}
      {/* EMPLOYEE DETAILS */}
      {/* --------------------------------------- */}

      <div className="card">
        <div className="section-title">
          Employee Details
        </div>

        <div className="form-grid">

          {/* Employee */}
          <div className="field">
            <label>Employee</label>

            <input
              readOnly
              value={employeeName}
            />
          </div>

          {/* Employee Code */}
          <div className="field">
            <label>Employee Code</label>

            <input
              readOnly
              value={employeeCode}
            />
          </div>

          {/* Department */}
          <div className="field">
            <label>Department</label>

            <input
              readOnly
              value={department}
            />
          </div>

        </div>
      </div>

      {/* --------------------------------------- */}
      {/* SALARY & WORKING DETAILS */}
      {/* --------------------------------------- */}

      <div className="card">
        <div className="section-title">
          Salary & Working Details
        </div>

        <div className="form-grid">

          {/* Salary Structure */}
          <div className="field">
            <label>Salary Structure</label>

            <input
              readOnly
              value={
                salaryStructure?.name ||
                salaryStructure?.code ||
                (typeof salaryStructure ===
                "string"
                  ? salaryStructure
                  : "-")
              }
            />
          </div>

          {/* Working Schedule */}
          <div className="field">
            <label>Working Schedule</label>

            <input
              readOnly
              value={
                workingSchedule?.name ||
                (typeof workingSchedule ===
                "string"
                  ? workingSchedule
                  : "-")
              }
            />
          </div>

        </div>
      </div>

      {/* --------------------------------------- */}
      {/* NOTES */}
      {/* --------------------------------------- */}

      {contract.notes && (
        <div className="card">
          <div className="section-title">
            Notes
          </div>

          <div className="field">
            <label>Notes</label>

            <input
              readOnly
              value={contract.notes}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}