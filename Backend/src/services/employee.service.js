const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const createEmployee = async (data) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingEmployee = await Employee.findOne({
    $or: [
      { email: normalizedEmail },
      { employeeCode: data.employeeCode.toUpperCase().trim() },
    ],
  });

  if (existingEmployee) {
    if (existingEmployee.email === normalizedEmail) {
      throw new ApiError(
        409,
        "Employee with this email already exists"
      );
    }

    throw new ApiError(
      409,
      "Employee with this employee code already exists"
    );
  }

  const employee = await Employee.create({
    ...data,

    employeeCode: data.employeeCode.toUpperCase().trim(),

    email: normalizedEmail,

    dateOfBirth: data.dateOfBirth
      ? new Date(data.dateOfBirth)
      : null,

    dateOfJoining: new Date(data.dateOfJoining),

    manager: data.manager || null,
  });

  return employee;
};

const getEmployees = async ({ page = 1, limit = 20, search }) => {
  const skip = (page - 1) * limit;

  const filter = {};

  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employeeCode: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
    ];
  }

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate("manager", "employeeCode firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getEmployeeById = async (employeeId) => {
  const employee = await Employee.findById(employeeId).populate(
    "manager",
    "employeeCode firstName lastName"
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee;
};

const updateEmployee = async (employeeId, data) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (data.email) {
    data.email = data.email.toLowerCase().trim();

    const existingEmail = await Employee.findOne({
      email: data.email,
      _id: { $ne: employeeId },
    });

    if (existingEmail) {
      throw new ApiError(
        409,
        "Another employee already uses this email"
      );
    }
  }

  if (data.employeeCode) {
    data.employeeCode = data.employeeCode.toUpperCase().trim();

    const existingCode = await Employee.findOne({
      employeeCode: data.employeeCode,
      _id: { $ne: employeeId },
    });

    if (existingCode) {
      throw new ApiError(
        409,
        "Another employee already uses this employee code"
      );
    }
  }

  if (data.dateOfBirth) {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }

  if (data.dateOfJoining) {
    data.dateOfJoining = new Date(data.dateOfJoining);
  }

  if (data.manager === undefined) {
    delete data.manager;
  }

  Object.assign(employee, data);

  await employee.save();

  return employee;
};

const deactivateEmployee = async (employeeId) => {
  const employee = await Employee.findById(employeeId);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (employee.employmentStatus === "TERMINATED") {
    throw new ApiError(400, "Employee is already terminated");
  }

  employee.employmentStatus = "TERMINATED";
  employee.terminationDate = new Date();

  await employee.save();

  return employee;
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};