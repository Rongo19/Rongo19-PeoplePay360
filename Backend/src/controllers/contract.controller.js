const contractService = require("../services/contract.service");

const {
  createContractSchema,
  updateContractSchema,
} = require("../validators/contract.validator");

const createContract = async (req, res) => {
  const data = createContractSchema.parse(req.body);

  const contract = await contractService.createContract(data);

  res.status(201).json({
    success: true,
    message: "Contract created successfully",
    data: contract,
  });
};

const getContracts = async (req, res) => {
  const contracts = await contractService.getContracts({
    employee: req.query.employee,
    status: req.query.status,
  });

  res.status(200).json({
    success: true,
    data: contracts,
  });
};

const getContractById = async (req, res) => {
  const contract = await contractService.getContractById(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: contract,
  });
};

const updateContract = async (req, res) => {
  const data = updateContractSchema.parse(req.body);

  const contract = await contractService.updateContract(
    req.params.id,
    data
  );

  res.status(200).json({
    success: true,
    message: "Contract updated successfully",
    data: contract,
  });
};

const activateContract = async (req, res) => {
  const contract = await contractService.activateContract(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Contract activated successfully",
    data: contract,
  });
};

const terminateContract = async (req, res) => {
  const contract = await contractService.terminateContract(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Contract terminated successfully",
    data: contract,
  });
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  activateContract,
  terminateContract,
};