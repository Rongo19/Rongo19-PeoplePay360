const mongoose = require("mongoose");

const timeOffAllocationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    timeOffType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeOffType",
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    allocatedDays: {
      type: Number,
      required: true,
      min: 0,
    },

    carriedForwardDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    adjustmentDays: {
      type: Number,
      default: 0,
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

timeOffAllocationSchema.index(
  {
    employee: 1,
    timeOffType: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "TimeOffAllocation",
  timeOffAllocationSchema
);