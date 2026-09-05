const PDFDocument = require("pdfkit");

const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const generatePayslipPDF = (payslip, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  const employee = payslip.employeeSnapshot;
  const contract = payslip.contractSnapshot;
  const salaryStructure = payslip.salaryStructureSnapshot;

  const currency = salaryStructure?.currency || "INR";

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="payslip-${employee.employeeCode}-${formatDate(
      payslip.periodEnd
    ).replace(/\s/g, "-")}.pdf"`
  );

  doc.pipe(res);

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("PEOPLEPAY360", { align: "center" });

  doc
    .fontSize(16)
    .font("Helvetica")
    .text("PAYSLIP", { align: "center" });

  doc.moveDown();

  doc
    .fontSize(10)
    .text(
      `Payroll Period: ${formatDate(payslip.periodStart)} - ${formatDate(
        payslip.periodEnd
      )}`,
      { align: "center" }
    );

  doc.moveDown(2);

  // --------------------------------------------------
  // EMPLOYEE INFORMATION
  // --------------------------------------------------

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Employee Information");

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Employee Code: ${employee.employeeCode || "-"}`)
    .text(
      `Employee Name: ${employee.firstName || ""} ${
        employee.lastName || ""
      }`
    )
    .text(`Email: ${employee.email || "-"}`)
    .text(`Department: ${employee.department || "-"}`)
    .text(`Designation: ${employee.designation || "-"}`);

  doc.moveDown();

  // --------------------------------------------------
  // CONTRACT INFORMATION
  // --------------------------------------------------

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Contract Information");

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Contract Number: ${contract?.contractNumber || "-"}`)
    .text(`Contract Type: ${contract?.contractType || "-"}`)
    .text(`Contract Start: ${formatDate(contract?.startDate)}`)
    .text(`Contract End: ${formatDate(contract?.endDate)}`);

  doc.moveDown();

  // --------------------------------------------------
  // SALARY STRUCTURE
  // --------------------------------------------------

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Salary Structure");

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Structure: ${salaryStructure?.name || "-"}`)
    .text(`Code: ${salaryStructure?.code || "-"}`)
    .text(`Pay Frequency: ${salaryStructure?.payFrequency || "-"}`)
    .text(`Currency: ${currency}`);

  doc.moveDown();

  // --------------------------------------------------
  // EARNINGS
  // --------------------------------------------------

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Earnings");

  doc.moveDown(0.5);

  doc.fontSize(10).font("Helvetica");

  if (payslip.earnings.length === 0) {
    doc.text("No earnings recorded.");
  } else {
    payslip.earnings.forEach((earning) => {
      doc.text(
        `${earning.name} (${earning.code})`,
        60,
        doc.y,
        {
          continued: true,
        }
      );

      doc.text(formatCurrency(earning.amount, currency), {
        align: "right",
      });
    });
  }

  doc.moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .text(
      `Gross Salary: ${formatCurrency(
        payslip.grossSalary,
        currency
      )}`,
      {
        align: "right",
      }
    );

  doc.moveDown();

  // --------------------------------------------------
  // DEDUCTIONS
  // --------------------------------------------------

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Deductions");

  doc.moveDown(0.5);

  doc.fontSize(10).font("Helvetica");

  if (payslip.deductions.length === 0) {
    doc.text("No deductions recorded.");
  } else {
    payslip.deductions.forEach((deduction) => {
      doc.text(
        `${deduction.name} (${deduction.code})`,
        60,
        doc.y,
        {
          continued: true,
        }
      );

      doc.text(formatCurrency(deduction.amount, currency), {
        align: "right",
      });
    });
  }

  doc.moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .text(
      `Total Deductions: ${formatCurrency(
        payslip.totalDeductions,
        currency
      )}`,
      {
        align: "right",
      }
    );

  doc.moveDown(1.5);

  // --------------------------------------------------
  // NET SALARY
  // --------------------------------------------------

  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(
      `NET SALARY: ${formatCurrency(
        payslip.netSalary,
        currency
      )}`,
      {
        align: "right",
      }
    );

  doc.moveDown(2);

  // --------------------------------------------------
  // ATTENDANCE SUMMARY
  // --------------------------------------------------

  doc
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("Attendance Summary");

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Working Days: ${payslip.workingDays}`)
    .text(`Worked Days: ${payslip.workedDays}`)
    .text(`Unpaid Leave Days: ${payslip.unpaidLeaveDays}`);

  doc.moveDown(2);

  // --------------------------------------------------
  // FOOTER
  // --------------------------------------------------

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This is a system-generated payslip from PeoplePay360.",
      {
        align: "center",
      }
    );

  doc
    .fontSize(8)
    .text(
      `Generated on ${formatDate(new Date())}`,
      {
        align: "center",
      }
    );

  doc.end();
};

module.exports = {
  generatePayslipPDF,
};