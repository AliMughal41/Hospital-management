const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const router = express.Router();

// Patients CRUD
router.get('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: [], message: 'List patients' });
});

router.post('/create-patient', authenticateJwt, (req, res) => {
	return res.status(201).json({ success: true, data: req.body, message: 'Create patient' });
});

router.get('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id }, message: 'Get patient' });
});

router.put('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id, ...req.body }, message: 'Update patient' });
});

router.delete('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, message: 'Delete patient' });
});

module.exports = router;


