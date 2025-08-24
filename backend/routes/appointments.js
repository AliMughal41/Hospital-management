const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const router = express.Router();

// Appointments CRUD
router.get('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: [], message: 'List appointments' });
});

router.post('/', authenticateJwt, (req, res) => {
	return res.status(201).json({ success: true, data: req.body, message: 'Create appointment' });
});

router.get('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id }, message: 'Get appointment' });
});

router.put('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id, ...req.body }, message: 'Update appointment' });
});

router.delete('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, message: 'Delete appointment' });
});

module.exports = router;


