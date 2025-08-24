const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const { 
  getTechnicianProfile,
  getTodayLabTests,
  getLabTestStats,
  getWorkingSchedule,
  getEquipmentStatus
} = require('../controllers/technicianDashboardController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJwt);

// Get technician profile information
router.get('/profile', getTechnicianProfile);

// Get today's lab tests for the technician
router.get('/lab-tests/today', getTodayLabTests);

// Get lab test statistics for the technician
router.get('/stats', getLabTestStats);

// Get working schedule for the technician
router.get('/schedule', getWorkingSchedule);

// Get equipment status for the technician
router.get('/equipment', getEquipmentStatus);

module.exports = router;
