const scheduleService = require("../services/schedule.service");

const {
  createScheduleSchema,
  updateScheduleSchema,
} = require("../validators/schedule.validator");

const createSchedule = async (req, res) => {
  const data = createScheduleSchema.parse(req.body);

  const schedule = await scheduleService.createSchedule(data);

  res.status(201).json({
    success: true,
    message: "Working schedule created successfully",
    data: schedule,
  });
};

const getSchedules = async (req, res) => {
  const schedules = await scheduleService.getSchedules({
    employee: req.query.employee,
    active: req.query.active,
  });

  res.status(200).json({
    success: true,
    data: schedules,
  });
};

const getScheduleById = async (req, res) => {
  const schedule = await scheduleService.getScheduleById(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: schedule,
  });
};

const updateSchedule = async (req, res) => {
  const data = updateScheduleSchema.parse(req.body);

  const schedule = await scheduleService.updateSchedule(
    req.params.id,
    data
  );

  res.status(200).json({
    success: true,
    message: "Working schedule updated successfully",
    data: schedule,
  });
};

const deactivateSchedule = async (req, res) => {
  const schedule = await scheduleService.deactivateSchedule(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Working schedule deactivated successfully",
    data: schedule,
  });
};

module.exports = {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deactivateSchedule,
};