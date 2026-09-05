const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    payFrequency: {
      type: String,
      enum: ["MONTHLY", "WEEKLY", "BIWEEKLY", "YEARLY"],
      default: "MONTHLY",
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    rules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SalaryRule",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SalaryStructure",
  salaryStructureSchema
);