const express = require('express');
const { authenticateJwt } = require('../middleware/auth');
const router = express.Router();

// Accounts CRUD
router.get('/', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: [], message: 'List accounts' });
});

router.post('/', authenticateJwt, (req, res) => {
	return res.status(201).json({ success: true, data: req.body, message: 'Create account' });
});

router.get('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id }, message: 'Get account' });
});

router.put('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, data: { id: req.params.id, ...req.body }, message: 'Update account' });
});

router.delete('/:id', authenticateJwt, (req, res) => {
	return res.json({ success: true, message: 'Delete account' });
});

module.exports = router;


