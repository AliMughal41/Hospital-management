const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const { 
  getReceptionistProfile,
  getTodayStats,
  getWorkingSchedule,
  getRecentActivity
} = require('../controllers/receptionistDashboardController');

const router = express.Router();

// All routes require authentication
router.use(authenticateJwt);

// Get receptionist profile information
router.get('/profile', getReceptionistProfile);

// Get today's statistics for the receptionist
router.get('/stats', getTodayStats);

// Get working schedule for the receptionist
router.get('/schedule', getWorkingSchedule);

// Get recent activities for the receptionist
router.get('/recent-activity', getRecentActivity);

module.exports = router;
