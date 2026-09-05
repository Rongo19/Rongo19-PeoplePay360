const mongoose = require("mongoose");

const workingDaySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
      required: true,
    },

    isWorkingDay: {
      type: Boolean,
      default: true,
    },

    startTime: {
      type: String,
      default: null,
    },

    endTime: {
      type: String,
      default: null,
    },

    breakMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    expectedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const workingScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    weeklySchedule: {
      type: [workingDaySchema],
      required: true,
    },

    totalWeeklyHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    effectiveFrom: {
      type: Date,
      required: true,
    },

    effectiveTo: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

workingScheduleSchema.index({
  employee: 1,
  effectiveFrom: 1,
  effectiveTo: 1,
});

const WorkingSchedule = mongoose.model(
  "WorkingSchedule",
  workingScheduleSchema
);

module.exports = WorkingSchedule;