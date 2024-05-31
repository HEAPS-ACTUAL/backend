const express = require('express');
const router = express.Router();
const { getAllUsers, authenticate } = require('../controllers/UserController');

// GET ALL USERS
router.get('/', getAllUsers);

// AUTHENTICATE
router.post('/authenticate', authenticate);

module.exports = router;