const express = require("express");
const { auth } = require("../config/firebase");

const router = express.Router();

// Verify Firebase ID Token
router.post("/verifyToken", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = await auth.verifyIdToken(token);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

module.exports = router;
