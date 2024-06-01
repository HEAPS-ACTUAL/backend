const express = require('express');
const router = express.Router();
const { getAllUsers, authenticate, getUserByEmail } = require('../controllers/UserController');

// GET ALL USERS
router.get('/', getAllUsers);

// GET USER BY EMAIL
router.get('/profile', getUserByEmail);

// AUTHENTICATE
router.post('/authenticate', authenticate);

module.exports = router;