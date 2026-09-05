const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    contractNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    contractType: {
      type: String,
      enum: [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "TEMPORARY",
        "INTERN",
      ],
      default: "FULL_TIME",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
    },

    workingSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkingSchedule",
      default: null,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "EXPIRED", "TERMINATED"],
      default: "DRAFT",
    },

    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

contractSchema.index({
  employee: 1,
  startDate: 1,
  endDate: 1,
});

module.exports = mongoose.model("Contract", contractSchema);