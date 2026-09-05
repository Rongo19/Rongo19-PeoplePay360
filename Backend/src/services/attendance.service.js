const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const WorkingSchedule = require("../models/WorkingSchedule");
const ApiError = require("../utils/ApiError");

// ======================================================
// HELPERS
// ======================================================

const getDayName = (date) => {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return days[date.getDay()];
};

const getScheduleForDate = async (employeeId, date) => {
  return WorkingSchedule.findOne({
    employee: employeeId,
    effectiveFrom: { $lte: date },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gte: date } },
    ],
    isActive: true,
  }).sort({ effectiveFrom: -1 });
};

const getScheduleDay = (schedule, date) => {
  if (!schedule) {
    return null;
  }

  const dayName = getDayName(date);

  return (
    schedule.weeklySchedule.find(
      (day) => day.day === dayName
    ) || null
  );
};

const calculateWorkedHours = (
  checkIn,
  checkOut,
  breakMinutes = 0
) => {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const milliseconds =
    checkOut.getTime() - checkIn.getTime();

  if (milliseconds <= 0) {
    throw new ApiError(
      400,
      "Check-out time must be after check-in time"
    );
  }

  const elapsedHours =
    milliseconds / (1000 * 60 * 60);

  const breakHours =
    Number(breakMinutes || 0) / 60;

  return Number(
    Math.max(0, elapsedHours - breakHours).toFixed(2)
  );
};

const getExpectedHours = async (
  employeeId,
  date
) => {
  const schedule =
    await getScheduleForDate(
      employeeId,
      date
    );

  const workingDay =
    getScheduleDay(schedule, date);

  if (
    !workingDay ||
    !workingDay.isWorkingDay
  ) {
    return 0;
  }

  return workingDay.expectedHours || 0;
};

// ======================================================
// CREATE ATTENDANCE
// ======================================================

const createAttendance = async (data) => {
  const employee =
    await Employee.findById(data.employee);

  if (!employee) {
    throw new ApiError(
      404,
      "Employee not found"
    );
  }

  const date = new Date(data.date);

  const existingAttendance =
    await Attendance.findOne({
      employee: data.employee,
      date,
    });

  if (existingAttendance) {
    throw new ApiError(
      409,
      "Attendance already exists for this employee on this date"
    );
  }

  const checkIn = data.checkIn
    ? new Date(data.checkIn)
    : null;

  const checkOut = data.checkOut
    ? new Date(data.checkOut)
    : null;

  // Get employee's schedule for this date
  const schedule =
    await getScheduleForDate(
      data.employee,
      date
    );

  const workingDay =
    getScheduleDay(schedule, date);

  const scheduleExpectedHours =
    workingDay?.isWorkingDay
      ? workingDay.expectedHours || 0
      : 0;

  const breakMinutes =
    workingDay?.isWorkingDay
      ? workingDay.breakMinutes || 0
      : 0;

  // Calculate actual worked hours AFTER break
  const workedHours =
    calculateWorkedHours(
      checkIn,
      checkOut,
      breakMinutes
    );

  // Respect manually supplied expectedHours,
  // otherwise use schedule value.
  const expectedHours =
    data.expectedHours !== undefined
      ? data.expectedHours
      : scheduleExpectedHours;

  let status = data.status;

  if (!status) {
    if (!checkIn && !checkOut) {
      status =
        expectedHours > 0
          ? "ABSENT"
          : "WEEKEND";
    } else if (
      expectedHours > 0 &&
      workedHours < expectedHours / 2
    ) {
      status = "HALF_DAY";
    } else {
      status = "PRESENT";
    }
  }

  const attendance =
    await Attendance.create({
      employee: data.employee,
      date,
      checkIn,
      checkOut,
      workedHours,
      expectedHours,
      status,
      notes: data.notes || null,
    });

  return attendance;
};

// ======================================================
// GET ATTENDANCE
// ======================================================

const getAttendances = async ({
  employee,
  startDate,
  endDate,
  status,
}) => {
  const filter = {};

  if (employee) {
    filter.employee = employee;
  }

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      filter.date.$gte =
        new Date(startDate);
    }

    if (endDate) {
      filter.date.$lte =
        new Date(endDate);
    }
  }

  const attendances =
    await Attendance.find(filter)
      .populate(
        "employee",
        "employeeCode firstName lastName department designation"
      )
      .sort({ date: -1 });

  return attendances;
};

// ======================================================
// GET ATTENDANCE BY ID
// ======================================================

const getAttendanceById = async (
  attendanceId
) => {
  const attendance =
    await Attendance.findById(
      attendanceId
    ).populate(
      "employee",
      "employeeCode firstName lastName department designation"
    );

  if (!attendance) {
    throw new ApiError(
      404,
      "Attendance record not found"
    );
  }

  return attendance;
};

// ======================================================
// UPDATE ATTENDANCE
// ======================================================

const updateAttendance = async (
  attendanceId,
  data
) => {
  const attendance =
    await Attendance.findById(
      attendanceId
    );

  if (!attendance) {
    throw new ApiError(
      404,
      "Attendance record not found"
    );
  }

  if (data.checkIn !== undefined) {
    attendance.checkIn = data.checkIn
      ? new Date(data.checkIn)
      : null;
  }

  if (data.checkOut !== undefined) {
    attendance.checkOut = data.checkOut
      ? new Date(data.checkOut)
      : null;
  }

  if (data.expectedHours !== undefined) {
    attendance.expectedHours =
      data.expectedHours;
  } else {
    // If expected hours weren't explicitly
    // supplied, refresh from employee schedule.
    attendance.expectedHours =
      await getExpectedHours(
        attendance.employee,
        attendance.date
      );
  }

  if (data.status !== undefined) {
    attendance.status = data.status;
  }

  if (data.notes !== undefined) {
    attendance.notes = data.notes;
  }

  // Get schedule to determine break duration
  const schedule =
    await getScheduleForDate(
      attendance.employee,
      attendance.date
    );

  const workingDay =
    getScheduleDay(
      schedule,
      attendance.date
    );

  const breakMinutes =
    workingDay?.isWorkingDay
      ? workingDay.breakMinutes || 0
      : 0;

  // Recalculate worked hours
  attendance.workedHours =
    calculateWorkedHours(
      attendance.checkIn,
      attendance.checkOut,
      breakMinutes
    );

  // Automatically determine status
  if (data.status === undefined) {
    if (
      !attendance.checkIn &&
      !attendance.checkOut
    ) {
      attendance.status =
        attendance.expectedHours > 0
          ? "ABSENT"
          : "WEEKEND";
    } else if (
      attendance.expectedHours > 0 &&
      attendance.workedHours <
        attendance.expectedHours / 2
    ) {
      attendance.status = "HALF_DAY";
    } else {
      attendance.status = "PRESENT";
    }
  }

  await attendance.save();

  return attendance;
};

module.exports = {
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
};