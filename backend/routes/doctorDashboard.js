const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const { 
  getDoctorProfile,
  getTodayAppointments,
  getAppointmentStats,
  getWorkingSchedule
} = require('../controllers/doctorDashboardController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJwt);

// Get doctor profile information
router.get('/profile', getDoctorProfile);

// Get today's appointments for the authenticated doctor
router.get('/appointments/today', getTodayAppointments);

// Get appointment statistics for the authenticated doctor
router.get('/stats', getAppointmentStats);

// Get working schedule for the authenticated doctor
router.get('/schedule', getWorkingSchedule);

module.exports = router;
