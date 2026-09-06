import { NavLink, useLocation, useNavigate } from "react-router-dom";

const TOP_LINKS = [
  { to: "/employees", label: "Employees" },
  { to: "/contracts", label: "Contracts" },
  { to: "/attendance", label: "Attendance" },
  { to: "/timeoff", label: "Time Off" },
  { to: "/payroll", label: "Payroll" },
];

const PAYROLL_LINKS = [
  { to: "/payroll", label: "Dashboard", end: true },
  { to: "/payroll/payruns", label: "Payruns" },
  { to: "/payroll/payslips", label: "Payslips" },
  { to: "/payroll/structures", label: "Structures" },
  { to: "/payroll/rules", label: "Rules" },
];

const TIMEOFF_LINKS = [
  { to: "/timeoff", label: "Time Offs", end: true },
  { to: "/timeoff-types", label: "Time Off Types" },
  { to: "/allocations", label: "Allocations" },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const showPayrollSubnav = location.pathname.startsWith("/payroll");
  const showTimeoffSubnav =
    location.pathname.startsWith("/timeoff") || location.pathname.startsWith("/allocations");

  const subLinks = showPayrollSubnav ? PAYROLL_LINKS : showTimeoffSubnav ? TIMEOFF_LINKS : null;

  return (
    <div className="app-shell">
      <div className="topnav">
        <span className="topnav-brand">PayPeople360</span>
        {TOP_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              "topnav-link" + (isActive || location.pathname.startsWith(link.to) ? " active" : "")
            }
          >
            {link.label}
          </NavLink>
        ))}
        <span className="topnav-spacer" />
        <span className="topnav-user">{localStorage.getItem("userName") || "admin"}</span>
        <button className="btn btn-sm" style={{ marginLeft: 10 }} onClick={() => navigate("/")}>
          Sign out
        </button>
      </div>

      <div className="body-area">
        {subLinks && (
          <div className="subnav">
            {subLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => "subnav-item" + (isActive ? " active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
