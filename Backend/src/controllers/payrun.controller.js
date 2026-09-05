const asyncHandler = require("../utils/asyncHandler");

const payrunService = require("../services/payrun.service");

const {
  payrollPeriodSchema,
  createPayrunSchema,
} = require("../validators/payroll.validator");

// ======================================================
// PREVIEW
// ======================================================

const previewPayrun = asyncHandler(
  async (req, res) => {
    const data =
      payrollPeriodSchema.parse(req.body);

    const result =
      await payrunService.previewPayrun(data);

    res.status(200).json({
      success: true,
      message:
        "Payroll preview generated successfully",
      data: result,
    });
  }
);

// ======================================================
// CREATE
// ======================================================

const createPayrun = asyncHandler(
  async (req, res) => {
    const data =
      createPayrunSchema.parse(req.body);

    const result =
      await payrunService.createPayrun({
        ...data,
        createdBy: req.user.userId,
      });

    res.status(201).json({
      success: true,
      message:
        "Payrun created successfully",
      data: result,
    });
  }
);

// ======================================================
// GET
// ======================================================

const getPayruns = asyncHandler(
  async (req, res) => {
    const result =
      await payrunService.getPayruns();

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

const getPayrunById = asyncHandler(
  async (req, res) => {
    const result =
      await payrunService.getPayrunById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

// ======================================================
// COMPUTE
// ======================================================

const computePayrun = asyncHandler(
  async (req, res) => {
    const result =
      await payrunService.computePayrun(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Payrun computed successfully",
      data: result,
    });
  }
);

// ======================================================
// VALIDATE
// ======================================================

const validatePayrun = asyncHandler(
  async (req, res) => {
    const result =
      await payrunService.validatePayrun(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Payrun validated successfully",
      data: result,
    });
  }
);

// ======================================================
// PAID
// ======================================================

const markPayrunPaid = asyncHandler(
  async (req, res) => {
    const result =
      await payrunService.markPayrunPaid(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message:
        "Payrun marked as paid successfully",
      data: result,
    });
  }
);

module.exports = {
  previewPayrun,
  createPayrun,
  getPayruns,
  getPayrunById,
  computePayrun,
  validatePayrun,
  markPayrunPaid,
};