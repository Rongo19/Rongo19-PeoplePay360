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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/users" element={<UserManagement />} />

        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />

        <Route path="/contracts" element={<Contracts />} />
        <Route path="/contracts/:id" element={<ContractDetail />} />

        <Route path="/schedules" element={<WorkingSchedules />} />

        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/:id" element={<AttendanceDetail />} />

        <Route path="/timeoff" element={<TimeOffRequests />} />
        <Route path="/timeoff/:id" element={<TimeOffRequestDetail />} />

        <Route path="/allocations" element={<Allocations />} />
        <Route path="/allocations/:id" element={<AllocationDetail />} />

        <Route path="/timeoff-types" element={<TimeOffTypes />} />
        <Route path="/timeoff-types/:id" element={<TimeOffTypeDetail />} />

        <Route path="/payroll" element={<PayrollDashboard />} />
        <Route path="/payroll/payruns" element={<PayRuns />} />
        <Route path="/payroll/payruns/new" element={<NewPayRun />} />
        <Route path="/payroll/payruns/:id" element={<PayRunDetail />} />
        <Route path="/payroll/payslips" element={<Payslips />} />
        <Route path="/payroll/payslips/:id" element={<PayslipDetail />} />
        <Route path="/payroll/structures" element={<SalaryStructures />} />
        <Route path="/payroll/structures/:id" element={<SalaryStructureDetail />} />
        <Route path="/payroll/rules" element={<SalaryRules />} />
        <Route path="/payroll/rules/:id" element={<SalaryRuleDetail />} />
      </Routes>
    </BrowserRouter>
  );

  
}
