const mongoose = require("mongoose");

const payslipLineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    category: {
      type: String,
      enum: ["EARNING", "DEDUCTION"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    sequence: {
      type: Number,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    payrun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payrun",
      required: true,
      index: true,
    },

    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    payDate: {
      type: Date,
      default: null,
    },

    employeeSnapshot: {
      employeeCode: String,
      firstName: String,
      lastName: String,
      email: String,
      department: String,
      designation: String,
    },

    contractSnapshot: {
      contractNumber: String,
      contractType: String,
      startDate: Date,
      endDate: Date,
    },

    salaryStructureSnapshot: {
      name: String,
      code: String,
      payFrequency: String,
      currency: String,
    },

    earnings: {
      type: [payslipLineSchema],
      default: [],
    },

    deductions: {
      type: [payslipLineSchema],
      default: [],
    },

    grossSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDeductions: {
      type: Number,
      default: 0,
      min: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    workingDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    workedDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    unpaidLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["DRAFT", "FINAL", "PAID"],
      default: "DRAFT",
    },

    pdfUrl: {
      type: String,
      default: null,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    emailSentAt: {
      type: Date,
      default: null,
    },

    warnings: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

payslipSchema.index(
  {
    employee: 1,
    periodStart: 1,
    periodEnd: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Payslip", payslipSchema);