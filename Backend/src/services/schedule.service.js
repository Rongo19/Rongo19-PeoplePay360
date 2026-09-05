const WorkingSchedule = require("../models/WorkingSchedule");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const createSchedule = async (data) => {
  if (data.employee) {
    const employee = await Employee.findById(data.employee);

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }
  }

  const effectiveFrom = new Date(data.effectiveFrom);

  const effectiveTo = data.effectiveTo
    ? new Date(data.effectiveTo)
    : null;

  if (effectiveTo && effectiveTo < effectiveFrom) {
    throw new ApiError(
      400,
      "Schedule end date cannot be before start date"
    );
  }

  // Calculate total weekly hours if not provided
  const calculatedWeeklyHours = data.weeklySchedule.reduce(
    (total, day) => total + (day.expectedHours || 0),
    0
  );

  const schedule = await WorkingSchedule.create({
    ...data,

    effectiveFrom,
    effectiveTo,

    totalWeeklyHours:
      data.totalWeeklyHours ?? calculatedWeeklyHours,
  });

  return schedule;
};

const getSchedules = async ({ employee, active }) => {
  const filter = {};

  if (employee) {
    filter.employee = employee;
  }

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  const schedules = await WorkingSchedule.find(filter)
    .populate(
      "employee",
      "employeeCode firstName lastName department designation"
    )
    .sort({ effectiveFrom: -1 });

  return schedules;
};

const getScheduleById = async (scheduleId) => {
  const schedule = await WorkingSchedule.findById(scheduleId).populate(
    "employee",
    "employeeCode firstName lastName department designation"
  );

  if (!schedule) {
    throw new ApiError(404, "Working schedule not found");
  }

  return schedule;
};

const updateSchedule = async (scheduleId, data) => {
  const schedule = await WorkingSchedule.findById(scheduleId);

  if (!schedule) {
    throw new ApiError(404, "Working schedule not found");
  }

  if (data.employee) {
    const employee = await Employee.findById(data.employee);

    if (!employee) {
      throw new ApiError(404, "Employee not found");
    }
  }

  if (data.effectiveFrom) {
    data.effectiveFrom = new Date(data.effectiveFrom);
  }

  if (data.effectiveTo) {
    data.effectiveTo = new Date(data.effectiveTo);
  }

  const effectiveFrom =
    data.effectiveFrom || schedule.effectiveFrom;

  const effectiveTo =
    data.effectiveTo !== undefined
      ? data.effectiveTo
      : schedule.effectiveTo;

  if (effectiveTo && effectiveTo < effectiveFrom) {
    throw new ApiError(
      400,
      "Schedule end date cannot be before start date"
    );
  }

  if (data.weeklySchedule) {
    data.totalWeeklyHours =
      data.weeklySchedule.reduce(
        (total, day) => total + (day.expectedHours || 0),
        0
      );
  }

  Object.assign(schedule, data);

  await schedule.save();

  return schedule;
};

const deactivateSchedule = async (scheduleId) => {
  const schedule = await WorkingSchedule.findById(scheduleId);

  if (!schedule) {
    throw new ApiError(404, "Working schedule not found");
  }

  schedule.isActive = false;

  await schedule.save();

  return schedule;
};

module.exports = {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deactivateSchedule,
};