const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route to register a new user
router.post('/register', authController.registerUser);

// Route to login a user
router.post('/login', authController.loginUser);

module.exports = router;
