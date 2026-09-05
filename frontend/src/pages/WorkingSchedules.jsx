import { useState } from "react";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { workingSchedules, weeklySchedule } from "../data/mockData";

export default function WorkingSchedules() {
  const [selected, setSelected] = useState(workingSchedules[0]);

  const columns = [
    { key: "name", label: "Schedule" },
    { key: "hoursPerWeek", label: "Hrs / Week" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Working Schedules</div>
          <div className="page-subtitle">List and form views</div>
        </div>
        <button className="btn btn-primary">New Schedule</button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-title">Schedules</div>
          <DataTable columns={columns} rows={workingSchedules} onRowClick={(row) => setSelected(row)} />
        </div>

        {selected && (
          <div className="card">
            <div className="section-title">{selected.name}</div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="field">
                <label>Schedule Name</label>
                <input readOnly value={selected.name} />
              </div>
              <div className="field">
                <label>Hours / Week</label>
                <input readOnly value={selected.hoursPerWeek} />
              </div>
              <div className="field">
                <label>Company</label>
                <input readOnly value={selected.company} />
              </div>
              <div className="field">
                <label>Status</label>
                <input readOnly value={selected.status} />
              </div>
            </div>

            <div className="section-title">Weekly Schedule</div>
            <DataTable
              columns={[
                { key: "day", label: "Day" },
                { key: "start", label: "Start Time" },
                { key: "end", label: "End Time" },
                { key: "break", label: "Break" },
              ]}
              rows={weeklySchedule}
              keyField="day"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
