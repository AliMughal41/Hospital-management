const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const router = express.Router();

// Lab tests CRUD
router.get('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: [], message: 'List lab tests' });
});

router.post('/', authenticateJwt, (req, res) => {
	return res.status(201).json({ success: true, data: req.body, message: 'Create lab test' });
});

router.get('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id }, message: 'Get lab test' });
});

router.put('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id, ...req.body }, message: 'Update lab test' });
});

router.delete('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, message: 'Delete lab test' });
});

module.exports = router;


