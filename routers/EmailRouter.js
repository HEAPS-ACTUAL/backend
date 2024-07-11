const express = require("express");
const router = express.Router();

const { sendVerificationEmail } = require("../controllers/EmailController");


// GET FLASHCARDS BY SCHEDULE ID
router.post('/verification', sendVerificationEmail);

module.exports = router;