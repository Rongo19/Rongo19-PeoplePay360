const mongoose = require("mongoose");

const payrunSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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

    status: {
      type: String,
      enum: [
        "DRAFT",
        "COMPUTED",
        "VALIDATED",
        "PAID",
      ],
      default: "DRAFT",
    },

    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    totalEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalGross: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDeductions: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalNet: {
      type: Number,
      default: 0,
      min: 0,
    },

    warnings: [
      {
        type: String,
        trim: true,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    computedAt: {
      type: Date,
      default: null,
    },

    validatedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

payrunSchema.index({
  periodStart: 1,
  periodEnd: 1,
});

module.exports = mongoose.model("Payrun", payrunSchema);