const employeeService = require("../services/employee.service");

const {
  createEmployeeSchema,
  updateEmployeeSchema,
} = require("../validators/employee.validator");

const createEmployee = async (req, res) => {
  const data = createEmployeeSchema.parse(req.body);

  const employee = await employeeService.createEmployee(data);

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: employee,
  });
};

const getEmployees = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(
    Math.max(parseInt(req.query.limit, 10) || 20, 1),
    100
  );

  const search = req.query.search?.trim();

  const result = await employeeService.getEmployees({
    page,
    limit,
    search,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

const getEmployeeById = async (req, res) => {
  const employee = await employeeService.getEmployeeById(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: employee,
  });
};

const updateEmployee = async (req, res) => {
  const data = updateEmployeeSchema.parse(req.body);

  const employee = await employeeService.updateEmployee(
    req.params.id,
    data
  );

  res.status(200).json({
    success: true,
    message: "Employee updated successfully",
    data: employee,
  });
};

const deactivateEmployee = async (req, res) => {
  const employee = await employeeService.deactivateEmployee(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Employee deactivated successfully",
    data: employee,
  });
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};