const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const { 
  login, 
  verifyToken, 
  forgotPassword, 
  contactAdmin 
} = require('../controllers/authController');

const router = express.Router();

// Public routes (no authentication required)
 // Firebase login/signup
router.post('/login', login);                 // Custom login with JWT
router.post('/forgot-password', forgotPassword);
router.post('/contact-admin', contactAdmin);

// Protected routes (authentication required)
router.get('/verify', authenticateJwt, verifyToken);

module.exports = router;
