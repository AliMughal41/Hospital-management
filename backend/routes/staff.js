const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const router = express.Router();

// Staff CRUD
router.get('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: [], message: 'List staff' });
});

router.post('/', authenticateJwt, (req, res) => {
	return res.status(201).json({ success: true, data: req.body, message: 'Create staff member' });
});

router.get('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id }, message: 'Get staff member' });
});

router.put('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id, ...req.body }, message: 'Update staff member' });
});

router.delete('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, message: 'Delete staff member' });
});

module.exports = router;


