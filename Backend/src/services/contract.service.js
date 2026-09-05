const Contract = require("../models/Contract");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const createContract = async (data) => {
  const employee = await Employee.findById(data.employee);

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  const existingContract = await Contract.findOne({
    contractNumber: data.contractNumber.toUpperCase().trim(),
  });

  if (existingContract) {
    throw new ApiError(
      409,
      "Contract with this number already exists"
    );
  }

  const startDate = new Date(data.startDate);
  const endDate = data.endDate
    ? new Date(data.endDate)
    : null;

  if (endDate && endDate < startDate) {
    throw new ApiError(
      400,
      "Contract end date cannot be before start date"
    );
  }

  // Check for overlapping contracts
  const overlappingContract = await Contract.findOne({
    employee: data.employee,
    startDate: { $lte: endDate || new Date("9999-12-31") },
    $or: [
      { endDate: null },
      { endDate: { $gte: startDate } },
    ],
  });

  if (overlappingContract) {
    throw new ApiError(
      409,
      "Contract dates overlap with an existing contract"
    );
  }

  const contract = await Contract.create({
    ...data,
    contractNumber: data.contractNumber.toUpperCase().trim(),
    startDate,
    endDate,
    status: "DRAFT",
  });

  return contract;
};

const getContracts = async ({ employee, status }) => {
  const filter = {};

  if (employee) {
    filter.employee = employee;
  }

  if (status) {
    filter.status = status;
  }

  const contracts = await Contract.find(filter)
    .populate(
      "employee",
      "employeeCode firstName lastName email department designation"
    )
    .populate(
      "salaryStructure",
      "name code payFrequency currency"
    )
    .populate(
      "workingSchedule",
      "name effectiveFrom effectiveTo"
    )
    .sort({ startDate: -1 });

  return contracts;
};

const getContractById = async (contractId) => {
  const contract = await Contract.findById(contractId)
    .populate(
      "employee",
      "employeeCode firstName lastName email department designation"
    )
    .populate(
      "salaryStructure",
      "name code payFrequency currency"
    )
    .populate("workingSchedule");

  if (!contract) {
    throw new ApiError(404, "Contract not found");
  }

  return contract;
};

const updateContract = async (contractId, data) => {
  const contract = await Contract.findById(contractId);

  if (!contract) {
    throw new ApiError(404, "Contract not found");
  }

  if (
    contract.status === "TERMINATED" ||
    contract.status === "EXPIRED"
  ) {
    throw new ApiError(
      400,
      "Cannot update an expired or terminated contract"
    );
  }

  if (data.contractNumber) {
    const contractNumber = data.contractNumber
      .toUpperCase()
      .trim();

    const duplicate = await Contract.findOne({
      contractNumber,
      _id: { $ne: contractId },
    });

    if (duplicate) {
      throw new ApiError(
        409,
        "Another contract already uses this number"
      );
    }

    data.contractNumber = contractNumber;
  }

  if (data.startDate) {
    data.startDate = new Date(data.startDate);
  }

  if (data.endDate) {
    data.endDate = new Date(data.endDate);
  }

  const startDate = data.startDate || contract.startDate;
  const endDate =
    data.endDate !== undefined
      ? data.endDate
      : contract.endDate;

  if (endDate && endDate < startDate) {
    throw new ApiError(
      400,
      "Contract end date cannot be before start date"
    );
  }

  Object.assign(contract, data);

  await contract.save();

  return contract;
};

const activateContract = async (contractId) => {
  const contract = await Contract.findById(contractId);

  if (!contract) {
    throw new ApiError(404, "Contract not found");
  }

  if (contract.status === "TERMINATED") {
    throw new ApiError(
      400,
      "A terminated contract cannot be activated"
    );
  }

  if (contract.startDate > new Date()) {
    throw new ApiError(
      400,
      "Cannot activate a contract before its start date"
    );
  }

  const overlappingContract = await Contract.findOne({
    employee: contract.employee,
    _id: { $ne: contractId },
    status: "ACTIVE",
    startDate: {
      $lte: contract.endDate || new Date("9999-12-31"),
    },
    $or: [
      { endDate: null },
      { endDate: { $gte: contract.startDate } },
    ],
  });

  if (overlappingContract) {
    throw new ApiError(
      409,
      "Employee already has another active contract for this period"
    );
  }

  contract.status = "ACTIVE";

  await contract.save();

  return contract;
};

const terminateContract = async (contractId) => {
  const contract = await Contract.findById(contractId);

  if (!contract) {
    throw new ApiError(404, "Contract not found");
  }

  if (contract.status === "TERMINATED") {
    throw new ApiError(
      400,
      "Contract is already terminated"
    );
  }

  contract.status = "TERMINATED";

  if (!contract.endDate) {
    contract.endDate = new Date();
  }

  await contract.save();

  return contract;
};

/**
 * Find the contract applicable to a payroll period.
 *
 * A contract is applicable when it overlaps the
 * requested payroll period.
 */
const findApplicableContract = async (
  employeeId,
  periodStart,
  periodEnd
) => {
  const contract = await Contract.findOne({
    employee: employeeId,

    startDate: {
      $lte: periodEnd,
    },

    $or: [
      { endDate: null },
      { endDate: { $gte: periodStart } },
    ],

    status: {
      $in: ["ACTIVE", "EXPIRED"],
    },
  })
    .sort({ startDate: -1 })
    .populate("salaryStructure")
    .populate("workingSchedule");

  return contract;
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  activateContract,
  terminateContract,
  findApplicableContract,
};