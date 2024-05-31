const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/UserController');

// GET ALL USERS
router.get('/', getAllUsers);

// AUTHENTICATE

module.exports = router;