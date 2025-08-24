const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const router = express.Router();

// Settings endpoints
router.get('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { theme: 'light' }, message: 'Get settings' });
});

router.put('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: req.body, message: 'Update settings' });
});

module.exports = router;


