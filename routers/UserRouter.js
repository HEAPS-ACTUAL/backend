/*
This file is in charge of determining which functions from UserController.js to 
execute based on the endpoint of the request that is being sent.
*/

const express = require('express');
const router = express.Router();
const { getAllUsers, authenticate, getUserByEmail, createNewUser } = require('../controllers/UserController');

// GET ALL USERS
router.get('/', getAllUsers);

// GET USER BY EMAIL
router.get('/profile', getUserByEmail);

// AUTHENTICATE
router.post('/authenticate', authenticate);

// RESGISTER
router.post('/register', createNewUser);

module.exports = router;