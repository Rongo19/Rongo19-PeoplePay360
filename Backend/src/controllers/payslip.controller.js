const asyncHandler = require("../utils/asyncHandler");
const payslipService = require("../services/payslip.service");
const { generatePayslipPDF } = require("../services/pdf.service");

const getPayslips = asyncHandler(async (req, res) => {
  const payslips = await payslipService.getPayslips({
    employeeId: req.query.employeeId,
    payrunId: req.query.payrunId,
    status: req.query.status,
  });

  res.status(200).json({
    success: true,
    data: payslips,
  });
});

const getPayslipById = asyncHandler(async (req, res) => {
  const payslip = await payslipService.getPayslipById(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: payslip,
  });
});

const downloadPayslipPDF = asyncHandler(async (req, res) => {
  const payslip = await payslipService.getPayslipById(
    req.params.id
  );

  await generatePayslipPDF(payslip, res);
});

const sendPayslipEmail = asyncHandler(async (req, res) => {
  const payslip =
    await payslipService.sendPayslipEmailById(
      req.params.id
    );

  res.status(200).json({
    success: true,
    message: "Payslip emailed successfully",
    data: {
      payslipId: payslip._id,
      employee: payslip.employee,
      emailSent: payslip.emailSent,
      emailSentAt: payslip.emailSentAt,
    },
  });
});

module.exports = {
  getPayslips,
  getPayslipById,
  downloadPayslipPDF,
  sendPayslipEmail,
};