import { Navigate, Outlet } from "react-router-dom";

export default function RoleRoute({ allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }

  const userRole = user?.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/employees" replace />;
  }

  return <Outlet />;
}