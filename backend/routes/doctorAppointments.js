const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const { 
  getDoctorAppointments,
  getTodayAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  addPrescription,
  addSalaryRecord,
  getAppointmentById
} = require('../controllers/doctorAppointmentsController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJwt);

// Get all appointments for the authenticated doctor
router.get('/', getDoctorAppointments);

// Get today's appointments for the authenticated doctor
router.get('/today', getTodayAppointments);

// Get specific appointment by ID
router.get('/:id', getAppointmentById);

// Confirm an appointment
router.put('/:id/confirm', confirmAppointment);

// Cancel an appointment
router.put('/:id/cancel', cancelAppointment);

// Complete an appointment
router.put('/:id/complete', completeAppointment);

// Add prescription for an appointment
router.post('/:id/prescription', addPrescription);

// Add salary record
router.post('/salary', addSalaryRecord);

module.exports = router;


