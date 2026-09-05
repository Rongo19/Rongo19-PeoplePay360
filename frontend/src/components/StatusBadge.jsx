const COLOR_MAP = {
  active: "green", approved: "green", paid: "green", done: "green", running: "green", present: "green",
  "to approve": "yellow", pending: "yellow", waiting: "yellow", validated: "yellow", late: "yellow", draft: "gray",
  refused: "red", absent: "red", inactive: "red",
};

export default function StatusBadge({ status }) {
  const key = String(status).toLowerCase();
  const color = COLOR_MAP[key] || "blue";
  return <span className={`badge badge-${color}`}>{status}</span>;
}
