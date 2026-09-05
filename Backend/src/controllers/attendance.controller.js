const attendanceService = require("../services/attendance.service");

const {
  createAttendanceSchema,
  updateAttendanceSchema,
} = require("../validators/attendance.validator");

const createAttendance = async (req, res) => {
  const data = createAttendanceSchema.parse(req.body);

  const attendance =
    await attendanceService.createAttendance(data);

  res.status(201).json({
    success: true,
    message: "Attendance created successfully",
    data: attendance,
  });
};

const getAttendances = async (req, res) => {
  const attendances =
    await attendanceService.getAttendances({
      employee: req.query.employee,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
    });

  res.status(200).json({
    success: true,
    data: attendances,
  });
};

const getAttendanceById = async (req, res) => {
  const attendance =
    await attendanceService.getAttendanceById(
      req.params.id
    );

  res.status(200).json({
    success: true,
    data: attendance,
  });
};

const updateAttendance = async (req, res) => {
  const data = updateAttendanceSchema.parse(req.body);

  const attendance =
    await attendanceService.updateAttendance(
      req.params.id,
      data
    );

  res.status(200).json({
    success: true,
    message: "Attendance updated successfully",
    data: attendance,
  });
};

module.exports = {
  createAttendance,
  getAttendances,
  getAttendanceById,
  updateAttendance,
};