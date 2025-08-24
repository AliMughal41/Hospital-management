const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const { 
  login, 
  verifyToken, 
  forgotPassword, 
  contactAdmin,
  testLogin
} = require('../controllers/authController');

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', login);                 // Firebase token login
router.post('/test-login', testLogin);        // Test login with email/password
router.post('/forgot-password', forgotPassword);
router.post('/contact-admin', contactAdmin);

// Protected routes (authentication required)
router.get('/verify', authenticateJwt, verifyToken);

module.exports = router;
