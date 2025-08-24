const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const router = express.Router();

// Blood bank CRUD
router.get('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: [], message: 'List blood bank records' });
});

router.post('/', authenticateJwt, (req, res) => {
	return res.status(201).json({ success: true, data: req.body, message: 'Create blood bank record' });
});

router.get('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id }, message: 'Get blood bank record' });
});

router.put('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id, ...req.body }, message: 'Update blood bank record' });
});

router.delete('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, message: 'Delete blood bank record' });
});

module.exports = router;


