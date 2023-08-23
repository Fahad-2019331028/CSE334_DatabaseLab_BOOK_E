const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authmiddleware');
const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');
const upload = require('../middleware/upload');

// Register a new user
router.post('/register', authController.registerUser);

// Login user
router.post('/login', authController.loginUser);

// Get user profile (protected route)
router.get('/profile', authMiddleware, userController.getUserProfile);

router.get('/uploader-profile/:user_id', authMiddleware, userController.getUserById);
// Edit user profile (protected route)
router.put('/profile/edit', authMiddleware, upload("profile_picture").single("profile_picture"), userController.editUserProfile);

// Get user inventory (protected route)
// router.get('/inventory', authMiddleware, userController.getUserInventory);

// Add a book to user inventory (protected route)
// router.post('/inventory/add', authMiddleware, bookController.addBook);

// Get user rating (protected route)
// router.get('/rating/:username', authMiddleware, userController.getUserRating);

module.exports = router;
