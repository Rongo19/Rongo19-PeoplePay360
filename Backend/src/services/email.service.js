const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendPayslipEmail = async ({
  to,
  employeeName,
  periodStart,
  periodEnd,
  pdfBuffer,
  filename,
}) => {
  if (!to) {
    throw new Error("Employee email is required");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `PeoplePay360 Payslip - ${periodStart} to ${periodEnd}`,
    text: `Hello ${employeeName},

Please find your payslip attached for the payroll period ${periodStart} to ${periodEnd}.

This is an automated email from PeoplePay360.

Regards,
PeoplePay360 HR & Payroll`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>PeoplePay360</h2>
        <p>Hello ${employeeName},</p>
        <p>
          Your payslip for the payroll period
          <strong>${periodStart} to ${periodEnd}</strong>
          is attached to this email.
        </p>
        <p>This is an automated email from PeoplePay360.</p>
        <br />
        <p>Regards,<br />PeoplePay360 HR & Payroll</p>
      </div>
    `,
    attachments: [
      {
        filename: filename || "payslip.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

const verifyEmailConnection = async () => {
  await transporter.verify();
  console.log("SMTP connection verified");
};

module.exports = {
  sendPayslipEmail,
  verifyEmailConnection,
};