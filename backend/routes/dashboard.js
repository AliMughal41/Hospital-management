const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const { 
  getTotalPatients,
  getTotalAppointments,
  getTotalLabTests,
  getTotalBloodBankUnits,
  getDashboardStats,
  getRecentActivity
} = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateJwt);

// Get individual statistics
router.get('/patients/count', getTotalPatients);
router.get('/appointments/count', getTotalAppointments);
router.get('/lab-tests/count', getTotalLabTests);
router.get('/blood-bank/units', getTotalBloodBankUnits);

// Get all dashboard statistics in one call
router.get('/stats', getDashboardStats);

// Get recent activity
router.get('/recent-activity', getRecentActivity);

module.exports = router;

