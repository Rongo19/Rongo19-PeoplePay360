// Central mock data store. In a real app this would come from an API.

export const employees = [
  { id: 1, name: "Aarav Mehta", jobPosition: "Payroll Specialist", department: "Payroll", manager: "Neha Rao", workLocation: "Mumbai Office", status: "Active" },
  { id: 2, name: "Neha Rao", jobPosition: "HR Manager", department: "HR", manager: "-", workLocation: "Mumbai Office", status: "Active" },
  { id: 3, name: "Sara Khan", jobPosition: "HR Executive", department: "HR", manager: "Neha Rao", workLocation: "Pune Office", status: "Active" },
  { id: 4, name: "Adia Patel", jobPosition: "Software Engineer", department: "Engineering", manager: "Sara Khan", workLocation: "Bangalore Office", status: "Active" },
  { id: 5, name: "John Stevens", jobPosition: "Software Engineer", department: "Engineering", manager: "Sara Khan", workLocation: "Bangalore Office", status: "Active" },
];

export const contracts = [
  { id: 1, employeeId: 1, reference: "CON/2026/0042", startDate: "2026-01-01", endDate: "-", wage: 78000, jobPosition: "Payroll Specialist", status: "Running" },
  { id: 2, employeeId: 2, reference: "CON/2026/0043", startDate: "2025-06-01", endDate: "-", wage: 95000, jobPosition: "HR Manager", status: "Running" },
  { id: 3, employeeId: 3, reference: "CON/2026/0044", startDate: "2025-09-15", endDate: "-", wage: 62000, jobPosition: "HR Executive", status: "Running" },
  { id: 4, employeeId: 4, reference: "CON/2026/0045", startDate: "2026-02-01", endDate: "-", wage: 88000, jobPosition: "Software Engineer", status: "Running" },
];

export const workingSchedules = [
  { id: 1, name: "40 hours / week", hoursPerWeek: 40, company: "My Company", status: "Active" },
  { id: 2, name: "Night Shift", hoursPerWeek: 40, company: "My Company", status: "Active" },
  { id: 3, name: "Relief Standard", hoursPerWeek: 40, company: "My Company", status: "Active" },
  { id: 4, name: "Flexible Hybrid", hoursPerWeek: 32, company: "My Company", status: "Active" },
  { id: 5, name: "Part-time 20%", hoursPerWeek: 8, company: "My Company", status: "Inactive" },
];

export const weeklySchedule = [
  { day: "Monday", start: "9:00 AM", end: "6:00 PM", break: "1h" },
  { day: "Tuesday", start: "9:00 AM", end: "6:00 PM", break: "1h" },
  { day: "Wednesday", start: "9:00 AM", end: "6:00 PM", break: "1h" },
  { day: "Thursday", start: "9:00 AM", end: "6:00 PM", break: "1h" },
  { day: "Friday", start: "9:00 AM", end: "6:00 PM", break: "1h" },
];

export const attendances = [
  { id: 1, employeeId: 1, date: "2026-09-02", checkIn: "09:02", checkOut: "18:05", worked: "9h 03m", status: "Present" },
  { id: 2, employeeId: 2, date: "2026-09-02", checkIn: "09:10", checkOut: "18:00", worked: "8h 50m", status: "Present" },
  { id: 3, employeeId: 3, date: "2026-09-02", checkIn: "09:45", checkOut: "18:15", worked: "8h 30m", status: "Late" },
  { id: 4, employeeId: 4, date: "2026-09-02", checkIn: "-", checkOut: "-", worked: "0h", status: "Absent" },
];

export const timeOffTypes = [
  { id: 1, name: "Paid Time Off", requiresAllocation: true, approval: "Required", takenInDays: true },
  { id: 2, name: "Sick Time Off", requiresAllocation: false, approval: "Not Required", takenInDays: true },
  { id: 3, name: "Unpaid Leave", requiresAllocation: false, approval: "Required", takenInDays: true },
];

export const timeOffRequests = [
  { id: 1, employeeId: 1, type: "Paid Time Off", start: "2026-09-10", end: "2026-09-12", duration: "3 Days", status: "Approved" },
  { id: 2, employeeId: 3, type: "Sick Time Off", start: "2026-09-05", end: "2026-09-05", duration: "1 Day", status: "To Approve" },
  { id: 3, employeeId: 4, type: "Paid Time Off", start: "2026-09-20", end: "2026-09-22", duration: "3 Days", status: "Refused" },
];

export const allocations = [
  { id: 1, employeeId: 1, type: "Paid Time Off", allocated: "20 Days", taken: "3 Days", remaining: "17 Days", status: "Approved" },
  { id: 2, employeeId: 3, type: "Paid Time Off", allocated: "18 Days", taken: "5 Days", remaining: "13 Days", status: "Approved" },
];

export const salaryStructures = [
  { id: 1, name: "Regular Salary", employees: 4, country: "India", type: "Regular" },
  { id: 2, name: "Contractor Salary", employees: 1, country: "India", type: "Contractor" },
];

export const salaryRules = [
  { id: 1, structureId: 1, code: "BASIC", name: "Basic Salary", category: "Basic", computation: "Fixed Amount", sequence: 10 },
  { id: 2, structureId: 1, code: "HRA", name: "House Rent Allowance", category: "Allowance", computation: "Percentage", sequence: 20 },
  { id: 3, structureId: 1, code: "PF", name: "Provident Fund", category: "Deduction", computation: "Percentage", sequence: 30 },
  { id: 4, structureId: 1, code: "NET", name: "Net Salary", category: "Net", computation: "Python Code", sequence: 100 },
];

export const payslipLines = [
  { code: "BASIC", name: "Basic Salary", amount: 45000 },
  { code: "HRA", name: "House Rent Allowance", amount: 18000 },
  { code: "GROSS", name: "Gross Salary", amount: 63000 },
  { code: "PF", name: "Provident Fund", amount: -5400 },
  { code: "TAX", name: "Professional Tax", amount: -200 },
  { code: "NET", name: "Net Salary", amount: 57400 },
];

export const payruns = [
  { id: 1, period: "January 2026", employees: 48, status: "Paid" },
  { id: 2, period: "February 2026", employees: 48, status: "Validated" },
  { id: 3, period: "March 2026", employees: 48, status: "Draft" },
];

export const payslips = [
  { id: 1, payrunId: 2, employeeId: 1, period: "February 2026", net: 57400, status: "Done" },
  { id: 2, payrunId: 2, employeeId: 2, period: "February 2026", net: 71200, status: "Done" },
  { id: 3, payrunId: 2, employeeId: 3, period: "February 2026", net: 48900, status: "Waiting" },
  { id: 4, payrunId: 2, employeeId: 4, period: "February 2026", net: 66300, status: "Done" },
];

export const employeeRecordsForPayrun = [
  { id: 1, employee: "Aditi Oberoi", workingHours: "40 hours/week", startDate: "Jan 1", wage: 45000 },
  { id: 2, employee: "Aashray Paterson", workingHours: "40 hours/week", startDate: "Jan 1", wage: 45000 },
  { id: 3, employee: "Billy Rah", workingHours: "40 hours/week", startDate: "Sep 3", wage: 32000 },
  { id: 4, employee: "Bill Lambert", workingHours: "40 hours/week", startDate: "Jan 1", wage: 48000 },
  { id: 5, employee: "Paul Wilson", workingHours: "40 hours/week", startDate: "Jul 1", wage: 39500 },
];

export const users = [
  { id: 1, name: "Neha Rao", email: "neha.rao@paypeople360.com", role: "Admin" },
  { id: 2, name: "Aarav Mehta", email: "aarav.mehta@paypeople360.com", role: "Payroll Admin" },
  { id: 3, name: "Sara Khan", email: "sara.khan@paypeople360.com", role: "HR User" },
  { id: 4, name: "Adia Patel", email: "adia.patel@paypeople360.com", role: "Employee" },
];

export const dashboardStats = {
  totalPaid: 1842000,
  employeesPaid: 148,
  avgSalary: 12432,
  avgTimeOff: 34,
  attendanceHealth: "94%",
  salaryByDepartment: [
    { dept: "HR", value: 210000 },
    { dept: "Engineering", value: 620000 },
    { dept: "Sales", value: 340000 },
    { dept: "Finance", value: 280000 },
    { dept: "Payroll", value: 180000 },
  ],
  netSalaryTrend: [
    { month: "Apr", value: 1620000 },
    { month: "May", value: 1650000 },
    { month: "Jun", value: 1700000 },
    { month: "Jul", value: 1690000 },
    { month: "Aug", value: 1780000 },
    { month: "Sep", value: 1842000 },
  ],
  payslipStatus: [
    { label: "Paid", value: 120, color: "#4ade80" },
    { label: "Pending", value: 20, color: "#facc15" },
    { label: "Waiting", value: 8, color: "#60a5fa" },
  ],
  attendanceOverview: { present: 130, absent: 8, late: 10 },
  timeOffOverview: { approved: 42, pending: 12, taken: 96 },
  departmentOverview: [
    { dept: "HR", headcount: 12 },
    { dept: "Engineering", headcount: 54 },
    { dept: "Sales", headcount: 30 },
    { dept: "Finance", headcount: 18 },
    { dept: "Payroll", headcount: 10 },
  ],
};

export const findEmployee = (id) => employees.find((e) => String(e.id) === String(id));
