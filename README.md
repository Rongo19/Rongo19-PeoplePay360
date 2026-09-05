# PeoplePay360 — HR & Payroll

> **PeoplePay360** is a full-stack HR & Payroll management platform built with the MERN stack. It connects employee management, contracts, attendance, leave, salary rules, payroll processing and payslips into one end-to-end workflow.

---

## 🚀 Overview

PeoplePay360 is designed to solve the problem of disconnected HR and payroll operations.

Instead of managing employee data, attendance, leave and payroll separately, the platform connects them:

```text
Employee
   ↓
Contract + Working Schedule
   ↓
Attendance + Time Off
   ↓
Salary Structure + Salary Rules
   ↓
Payrun
   ↓
Payslip
   ↓
PDF / Email
   ↓
Dashboard
```

The project is optimized for a **24-hour hackathon MVP** while keeping the backend architecture production-oriented.

---

## ✨ Key Features

### 👥 Employee Management
- Create and manage employees
- Employee profiles
- Employee codes
- Departments and designations
- Managers
- Employment status
- Employee deactivation
- Historical employee information

### 📄 Contract Management
- Employee contracts
- Contract numbers
- Contract types
- Start/end dates
- Salary structure association
- Working schedule association
- Contract activation/termination
- Historical contracts

### ⏰ Attendance
- Check-in/check-out
- Worked-hours calculation
- Break-time handling
- Attendance records
- Expected vs actual working hours

### 🌴 Time-Off Management
- Custom time-off types
- Paid/unpaid leave
- Approval requirements
- Yearly allocations
- Carry-forward days
- Adjustments
- Leave requests
- Approval/rejection/cancellation
- Employee leave balance

### 💰 Salary & Payroll
- Salary structures
- Ordered salary rules
- Fixed salary rules
- Percentage-based rules
- Formula-based rules
- Earnings
- Deductions
- Gross salary
- Net salary
- Payroll warnings
- Historical contract-aware payroll

### 🧾 Payslips
- Payslip generation
- Employee/contract/salary snapshots
- Gross and net salary
- Earnings and deductions
- Attendance information
- Payroll warnings
- PDF generation
- Email delivery
- Duplicate payslip protection

### 📊 Dashboard
- Employee metrics
- Payroll metrics
- Leave information
- Attendance information
- Payroll warnings
- Real database-backed statistics

---

# 🛠️ Tech Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | UI |
| Vite | Development/build tooling |
| React Router | Application routing |
| Axios | API communication |
| CSS | Styling |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | REST API |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Zod | Request validation |
| PDFKit | Payslip PDFs |
| Nodemailer | Email |
| Helmet | Security headers |
| CORS | Cross-origin access |
| express-rate-limit | Rate limiting |
| dotenv | Environment configuration |

---

# 🏗️ Architecture

```text
┌──────────────────────────────┐
│       React + Vite           │
│          Frontend             │
└──────────────┬───────────────┘
               │
               │ Axios / REST
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│          /api/v1             │
└──────────────┬───────────────┘
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
 Controllers Services Middleware
               │
               ▼
        Mongoose Models
               │
               ▼
        ┌──────────────┐
        │ MongoDB Atlas│
        └──────────────┘
```

---

# 📁 Project Structure

```text
PeoplePay360/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   └── app.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── README.md
```

---

# 🔐 Authentication & Authorization

Authentication is implemented using:

```text
JWT + bcryptjs
```

### Login Flow

```text
User Login
    ↓
Validate credentials
    ↓
Compare password using bcrypt
    ↓
Generate JWT
    ↓
Frontend receives token
    ↓
Axios sends Authorization header
    ↓
Backend validates token
    ↓
Role authorization
```

### Supported Roles

```text
Employee
HR Manager
HR Payroll User
HR Payroll Manager
Admin
```

Protected endpoints use authentication middleware and role-based authorization.

---

# 🗄️ Database Models

PeoplePay360 uses the following primary MongoDB/Mongoose models:

```text
User
Employee
WorkingSchedule
Contract
Attendance
TimeOffType
TimeOffAllocation
TimeOffRequest
SalaryStructure
SalaryRule
Payrun
Payslip
```

### Relationship Overview

```text
User
 │
 └──────► Employee
              │
       ┌──────┼─────────┐
       │      │         │
       ▼      ▼         ▼
    Contract Attendance Time Off
       │                │
       ▼          ┌─────┴─────┐
SalaryStructure   ▼           ▼
       │       Allocation   Request
       ▼
  SalaryRule
       │
       ▼
    Payrun
       │
       ▼
    Payslip
       │
   ┌───┴───┐
   ▼       ▼
  PDF     Email
```

---

# 👤 Employee API

Base endpoint:

```text
/api/v1/employees
```

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/employees` | Create employee |
| GET | `/employees` | List employees |
| GET | `/employees/:id` | Get employee |
| PATCH | `/employees/:id` | Update employee |
| PATCH | `/employees/:id/deactivate` | Deactivate employee |

Example frontend API:

```js
import api from "./api";

export const getEmployees = async (params = {}) => {
  return api.get("/employees", { params });
};

export const getEmployee = async (id) => {
  return api.get(`/employees/${id}`);
};

export const createEmployee = async (employeeData) => {
  return api.post("/employees", employeeData);
};

export const updateEmployee = async (id, employeeData) => {
  return api.patch(`/employees/${id}`, employeeData);
};

export const deactivateEmployee = async (id) => {
  return api.patch(`/employees/${id}/deactivate`);
};
```

---

# 📄 Contract API

Base endpoint:

```text
/api/v1/contracts
```

```http
GET    /contracts
GET    /contracts/:id
POST   /contracts
PATCH  /contracts/:id
PATCH  /contracts/:id/activate
PATCH  /contracts/:id/terminate
```

Contracts contain the salary structure and working schedule used by payroll.

### Important Payroll Rule

Payroll must select the contract that applies to the payroll period.

It should **not** blindly use:

```text
employee.currentContract
```

This allows historical payroll to remain correct when employees change contracts.

---

# ⏰ Attendance API

```http
GET   /attendance
GET   /attendance/:id
POST  /attendance
PATCH /attendance/:id
```

Worked hours are calculated from:

```text
Check-out - Check-in - Break Duration
```

Invalid time ranges are rejected by the backend.

---

# 🌴 Time-Off API

## Time-Off Types

```http
POST  /timeoff/types
GET   /timeoff/types
PATCH /timeoff/types/:id
```

Time-off types contain:

```text
name
code
description
isPaid
requiresApproval
isActive
```

Names and codes are unique.

---

## Allocations

```http
POST /timeoff/allocations
GET  /timeoff/allocations
```

Optional filters:

```text
employeeId
year
timeOffTypeId
```

Allocation data:

```text
employeeId
timeOffTypeId
year
allocatedDays
carriedForwardDays
adjustmentDays
notes
```

An employee cannot have duplicate allocations for the same:

```text
employee + time-off type + year
```

---

## Requests

```http
GET   /timeoff/requests
GET   /timeoff/requests/:id
POST  /timeoff/requests
PATCH /timeoff/requests/:id/approve
PATCH /timeoff/requests/:id/reject
PATCH /timeoff/requests/:id/cancel
```

Typical flow:

```text
Requested
    ↓
Approved / Rejected
    ↓
Cancelled if required
```

Approved requests reduce available leave balance.

---

# 💰 Salary & Payroll

Salary is not hardcoded into the payroll controller.

Instead:

```text
Contract
   ↓
Salary Structure
   ↓
Salary Rules
   ↓
Payroll Engine
```

Salary rules can represent:

```text
Basic Salary
Housing Allowance
Transport Allowance
Bonus
Tax
Provident Fund
Other deductions
```

Calculation types include:

```text
Fixed
Percentage
Formula
Sequence
```

---

# 🧮 Payroll Calculation

The payroll engine follows this general flow:

```text
Employee
   ↓
Find applicable contract
   ↓
Find salary structure
   ↓
Load salary rules
   ↓
Calculate earnings
   ↓
Calculate deductions
   ↓
Gross Salary
   ↓
Net Salary
   ↓
Warnings
   ↓
Payslip
```

### Payroll warnings

The system can detect conditions such as:

- Missing contract
- Contract overlap
- Missing salary structure
- Missing attendance
- Duplicate payslip
- Other payroll validation problems

---

# 💳 Payrun

Suggested lifecycle:

```text
DRAFT
  ↓
PREVIEW
  ↓
COMPUTED
  ↓
VALIDATED
  ↓
PAID
```

The payroll workflow is intended to support:

```text
Preview
Compute
Validate
Pay
```

---

# 🧾 Payslips

Payslips preserve historical payroll information using snapshots.

A payslip can contain:

```text
Employee snapshot
Contract snapshot
Salary snapshot
Earnings
Deductions
Gross salary
Net salary
Attendance information
Warnings
Status
PDF URL
Email status
```

Duplicate payslips for the same employee/payroll period are prevented.

---

# 📄 PDF & Email

### PDF

Uses:

```text
PDFKit
```

Flow:

```text
Payrun
  ↓
Payslip
  ↓
Generate PDF
  ↓
Store/reference PDF
```

### Email

Uses:

```text
Nodemailer
```

Flow:

```text
Payslip
  ↓
PDF
  ↓
Email Employee
  ↓
Update Email Status
```

---

# 📊 Dashboard

The dashboard is designed to use real database information.

Possible metrics:

```text
Total Employees
Active Employees
Employees on Leave
Current Payroll
Pending Leave Requests
Attendance Summary
Payroll Warnings
```

---

# 🌐 Frontend API Integration

The frontend uses a shared Axios instance.

Example:

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;
```

API modules are separated from pages:

```text
src/api/
├── api.js
├── employeeApi.js
├── contractApi.js
├── attendanceApi.js
├── timeoffApi.js
├── payrollApi.js
└── payslipApi.js
```

This keeps API logic reusable and keeps React components focused on UI.

---

# 🌍 Two-Laptop Development

The backend developer can expose the local backend using ngrok.

```text
Frontend Laptop
       |
       | HTTPS
       ▼
     ngrok
       |
       ▼
Backend Laptop
       |
       ▼
MongoDB Atlas
```

Start the backend:

```bash
cd backend
npm run dev
```

Start ngrok:

```bash
ngrok http 5000
```

Then set the frontend environment variable:

```env
VITE_API_URL=https://<NGROK_DOMAIN>/api/v1
```

Restart the Vite server after changing `.env`.

> The ngrok domain can change after restarting the tunnel.

---

# ⚙️ Installation

## Clone / enter project

```bash
cd PeoplePay360
```

## Backend

```bash
cd backend
npm install
```

## Frontend

```bash
cd frontend
npm install
```

---

# ▶️ Running the Project

## Backend

```bash
cd backend
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

## Frontend

```bash
cd frontend
npm run dev
```

Frontend development server runs on the Vite-configured port, currently expected to be:

```text
http://localhost:5174
```

---

# 🔑 Environment Configuration

## Backend `.env`

```env
PORT=5000
MONGO_URI=<YOUR_MONGODB_ATLAS_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5174

EMAIL_HOST=<SMTP_HOST>
EMAIL_PORT=<SMTP_PORT>
EMAIL_USER=<SMTP_USER>
EMAIL_PASSWORD=<SMTP_PASSWORD>
EMAIL_FROM=<FROM_EMAIL>
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For ngrok:

```env
VITE_API_URL=https://<NGROK_DOMAIN>/api/v1
```

Never commit real credentials.

---

# 🔒 Security

The backend uses:

```text
Helmet
CORS
Rate limiting
JWT authentication
bcrypt password hashing
Zod validation
Role-based authorization
Centralized error handling
```

Do not commit:

```text
.env
JWT secrets
MongoDB credentials
SMTP passwords
API keys
Private keys
```

Use `.env.example` to document required variables.

---

# 🧪 Testing Strategy

Recommended testing order:

```text
1. Health check
2. Login
3. Employee creation
4. Employee listing
5. Contract creation
6. Attendance creation
7. Time-off type
8. Allocation
9. Time-off request
10. Salary structure
11. Salary rules
12. Payrun
13. Payslip
14. PDF
15. Email
16. Dashboard
```

When consuming list APIs in React, verify that the response is an array before using:

```js
.map()
.filter()
.reduce()
```

---

# 🐛 Troubleshooting

## `employees.map is not a function`

This means `employees` contains an object instead of an array.

Normalize the API response:

```js
const employeeData = employeeResponse.data?.data;

setEmployees(
  Array.isArray(employeeData)
    ? employeeData
    : employeeData?.employees || []
);
```

For time-off types:

```js
const typeData = typeResponse.data?.data;

setTimeOffTypes(
  Array.isArray(typeData)
    ? typeData
    : typeData?.types || []
);
```

---

## CORS Error

Check:

```text
Frontend origin
Backend CORS configuration
VITE_API_URL
ngrok URL
```

---

## 401 Unauthorized

Check:

```text
JWT token
Authorization header
Token expiration
JWT_SECRET
```

---

## 404 Not Found

Check:

```text
Backend is running
Correct API path
/api/v1 prefix
VITE_API_URL
```

---

## MongoDB Error

Check:

```text
MONGO_URI
MongoDB Atlas network access
Database credentials
Environment variables
```

---

## Allocation Creation Error

Verify:

```text
employeeId
timeOffTypeId
year
allocatedDays
```

Also verify:

```text
Time-off type is active
Allocation does not already exist
```

---

# 🎯 Hackathon Demo Flow

The recommended presentation flow is:

```text
Login
  ↓
Dashboard
  ↓
Employee List
  ↓
Employee Profile
  ↓
Contract
  ↓
Attendance
  ↓
Time-Off Type
  ↓
Allocation
  ↓
Leave Request
  ↓
Approve Leave
  ↓
Payroll
  ↓
Preview Payrun
  ↓
Compute Payroll
  ↓
Validate Payroll
  ↓
Generate Payslip
  ↓
PDF
  ↓
Email
  ↓
Updated Dashboard
```

### Main selling point

The project demonstrates a complete:

```text
HR → Attendance → Leave → Salary → Payroll → Payslip
```

workflow using real database-backed business logic.

---

# 🏆 MVP Priorities

## Must Have

- Authentication
- Employee CRUD
- Contracts
- Working schedules
- Attendance
- Time-off types
- Allocations
- Time-off requests
- Salary structures
- Salary rules
- Payrun
- Payslip
- Dashboard

## High-Value Demo Features

- PDF payslip
- Email payslip
- Payroll warnings
- Real dashboard data
- Historical contract handling
- Automated payroll calculation

## Can Be Simplified

- Advanced permissions
- Complex tax engine
- Multi-company support
- Advanced reporting
- Background job processing
- Full audit system

---

# 🔮 Future Improvements

- Redis caching
- Background job queues
- Audit logs
- Advanced payroll formulas
- Tax/statutory configurations
- Multi-company support
- Multi-currency
- Localization
- Cloud object storage
- Automated tests
- CI/CD
- Docker
- Monitoring and logging
- Refresh tokens
- Password reset
- MFA
- Fine-grained permissions
- Payroll locking
- Payroll approval workflows
- Attendance imports
- Bank payment integration

---

# 📌 Core Business Rules

### Employees

- Employee code must be unique.
- Employee email must be unique.
- Deactivated employees should not be treated as active payroll employees.

### Contracts

- Historical contracts must be preserved.
- Payroll selects the contract applicable to the payroll period.
- Contract overlaps should generate warnings or validation failures.

### Attendance

- Checkout must be after check-in.
- Worked hours can account for breaks.

### Time Off

- Time-off names and codes are unique.
- Inactive time-off types cannot be used for new allocations.
- Employee/type/year allocations cannot be duplicated.
- Approved leave reduces available balance.

### Payroll

- Salary comes from salary structures/rules.
- Payroll does not hardcode employee salary amounts.
- Duplicate payslips are prevented.
- Payslips preserve historical snapshots.

---

# 👨‍💻 Development Philosophy

### Real data over mock data

Once an API exists, frontend pages should consume the real backend instead of static mock data.

### Business logic belongs in the backend

React handles:

```text
UI
Forms
Navigation
API interaction
Presentation
```

Backend handles:

```text
Validation
Authorization
Business rules
Payroll calculation
Database operations
PDF generation
Email
```

### Historical correctness

Payroll must remain accurate even when employee contracts or salary information change later.

### Hackathon simplicity

The system should demonstrate meaningful business logic without introducing unnecessary complexity that risks the 24-hour delivery.

---

# 📜 License

This project is currently developed as a hackathon project.

Add your preferred license before public distribution.

---

# 👥 Team

**Project:** PeoplePay360 — HR & Payroll

**Architecture:** MERN Stack

**Backend:** Node.js + Express + MongoDB

**Frontend:** React + Vite

---

## ⭐ PeoplePay360

> **From employee onboarding to payroll — one connected HR workflow.**
