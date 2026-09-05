import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import { attendances, findEmployee } from "../data/mockData";

export default function AttendanceDetail() {
  const { id } = useParams();
  const record = attendances.find((a) => String(a.id) === String(id));

  if (!record) {
    return (
      <Layout>
        <div className="empty-state">Attendance record not found.</div>
      </Layout>
    );
  }

  const employee = findEmployee(record.employeeId);

  return (
    <Layout>
      <Link to="/attendance" className="back-link">
        ← Back to Attendance
      </Link>
      <div className="page-header">
        <div>
          <div className="page-title">
            Attendance / {employee?.name} / {record.date}
          </div>
          <div className="page-subtitle">One view of an employee attendance record</div>
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
            <label>Department</label>
            <input readOnly value={employee?.department || "-"} />
          </div>
          <div className="field">
            <label>Date</label>
            <input readOnly value={record.date} />
          </div>
          <div className="field">
            <label>Worked Hours</label>
            <input readOnly value={record.worked} />
          </div>
          <div className="field">
            <label>Check In</label>
            <input readOnly value={record.checkIn} />
          </div>
          <div className="field">
            <label>Check Out</label>
            <input readOnly value={record.checkOut} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
