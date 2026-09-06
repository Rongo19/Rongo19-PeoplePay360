import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

import UserManagement from "./pages/UserManagement";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import WorkingSchedules from "./pages/WorkingSchedules";
import Attendance from "./pages/Attendance";
import AttendanceDetail from "./pages/AttendanceDetail";
import TimeOffRequests from "./pages/TimeOffRequests";
import TimeOffRequestDetail from "./pages/TimeOffRequestDetail";
import Allocations from "./pages/Allocations";
import AllocationDetail from "./pages/AllocationDetail";
import TimeOffTypes from "./pages/TimeOffTypes";
import TimeOffTypeDetail from "./pages/TimeOffTypeDetail";

import PayrollDashboard from "./pages/PayrollDashboard";
import PayRuns from "./pages/PayRuns";
import NewPayRun from "./pages/NewPayRun";
import PayRunDetail from "./pages/PayRunDetail";
import Payslips from "./pages/Payslips";
import PayslipDetail from "./pages/PayslipDetail";
import SalaryStructures from "./pages/SalaryStructures";
import SalaryStructureDetail from "./pages/SalaryStructureDetail";
import SalaryRules from "./pages/SalaryRules";
import SalaryRuleDetail from "./pages/SalaryRuleDetail";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import { PERMISSIONS } from "./config/permissions";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route path="/" element={<Login />} />


        {/* =====================================================
            AUTHENTICATED ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>


          {/* ===================================================
              ADMIN ONLY
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.users} />
            }
          >
            <Route
              path="/users"
              element={<UserManagement />}
            />
          </Route>


          {/* ===================================================
              EMPLOYEES
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.employees} />
            }
          >
            <Route
              path="/employees"
              element={<Employees />}
            />

            <Route
              path="/employees/:id"
              element={<EmployeeProfile />}
            />
          </Route>


          {/* ===================================================
              CONTRACTS
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.contracts} />
            }
          >
            <Route
              path="/contracts"
              element={<Contracts />}
            />

            <Route
              path="/contracts/:id"
              element={<ContractDetail />}
            />
          </Route>


          {/* ===================================================
              WORKING SCHEDULES
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.schedules} />
            }
          >
            <Route
              path="/schedules"
              element={<WorkingSchedules />}
            />
          </Route>


          {/* ===================================================
              ATTENDANCE
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.attendance} />
            }
          >
            <Route
              path="/attendance"
              element={<Attendance />}
            />

            <Route
              path="/attendance/:id"
              element={<AttendanceDetail />}
            />
          </Route>


          {/* ===================================================
              TIME OFF
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.timeoff} />
            }
          >
            <Route
              path="/timeoff"
              element={<TimeOffRequests />}
            />

            <Route
              path="/timeoff/:id"
              element={<TimeOffRequestDetail />}
            />
          </Route>


          {/* ===================================================
              ALLOCATIONS
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.allocations} />
            }
          >
            <Route
              path="/allocations"
              element={<Allocations />}
            />

            <Route
              path="/allocations/:id"
              element={<AllocationDetail />}
            />
          </Route>


          {/* ===================================================
              TIME OFF TYPES
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.timeoffTypes} />
            }
          >
            <Route
              path="/timeoff-types"
              element={<TimeOffTypes />}
            />

            <Route
              path="/timeoff-types/:id"
              element={<TimeOffTypeDetail />}
            />
          </Route>


          {/* ===================================================
              PAYROLL
          =================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={PERMISSIONS.payroll} />
            }
          >
            <Route
              path="/payroll"
              element={<PayrollDashboard />}
            />

            <Route
              path="/payroll/payruns"
              element={<PayRuns />}
            />

            <Route
              path="/payroll/payruns/new"
              element={<NewPayRun />}
            />

            <Route
              path="/payroll/payruns/:id"
              element={<PayRunDetail />}
            />

            <Route
              path="/payroll/payslips"
              element={<Payslips />}
            />

            <Route
              path="/payroll/payslips/:id"
              element={<PayslipDetail />}
            />
          </Route>


          {/* ===================================================
              SALARY STRUCTURES
          =================================================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={PERMISSIONS.salaryStructures}
              />
            }
          >
            <Route
              path="/payroll/structures"
              element={<SalaryStructures />}
            />

            <Route
              path="/payroll/structures/:id"
              element={<SalaryStructureDetail />}
            />
          </Route>


          {/* ===================================================
              SALARY RULES
          =================================================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={PERMISSIONS.salaryRules}
              />
            }
          >
            <Route
              path="/payroll/rules"
              element={<SalaryRules />}
            />

            <Route
              path="/payroll/rules/:id"
              element={<SalaryRuleDetail />}
            />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}