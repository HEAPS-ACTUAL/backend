const express = require("express");
const router = express.Router();

const { sendVerificationEmail } = require("../controllers/EmailController");
const {verifyToken } = require("../controllers/TokenController");

// VERIFY EMAIL TOKEN
router.post('/verify-email', verifyToken);

// SEND VERIFICATION EMAIL
router.post('/send-verification-email', sendVerificationEmail);

module.exports = router;