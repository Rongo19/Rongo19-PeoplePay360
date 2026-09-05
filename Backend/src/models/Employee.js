const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
      default: "PREFER_NOT_TO_SAY",
    },

    address: {
      street: {
        type: String,
        trim: true,
        default: null,
      },
      city: {
        type: String,
        trim: true,
        default: null,
      },
      state: {
        type: String,
        trim: true,
        default: null,
      },
      country: {
        type: String,
        trim: true,
        default: "India",
      },
      postalCode: {
        type: String,
        trim: true,
        default: null,
      },
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfJoining: {
      type: Date,
      required: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    employmentStatus: {
      type: String,
      enum: [
        "ACTIVE",
        "ON_LEAVE",
        "SUSPENDED",
        "RESIGNED",
        "TERMINATED",
      ],
      default: "ACTIVE",
    },

    terminationDate: {
      type: Date,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;