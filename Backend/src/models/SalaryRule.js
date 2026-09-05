const mongoose = require("mongoose");

const salaryRuleSchema = new mongoose.Schema(
  {
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true,
      index: true,
    },

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

    calculationType: {
      type: String,
      enum: ["FIXED", "PERCENTAGE", "FORMULA"],
      required: true,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    formula: {
      type: String,
      default: null,
      trim: true,
    },

    sequence: {
      type: Number,
      required: true,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

salaryRuleSchema.index({
  salaryStructure: 1,
  sequence: 1,
});

salaryRuleSchema.index(
  {
    salaryStructure: 1,
    code: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "SalaryRule",
  salaryRuleSchema
);