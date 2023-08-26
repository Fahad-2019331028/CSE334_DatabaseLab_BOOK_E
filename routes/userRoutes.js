const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authmiddleware');
const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');
const upload = require('../middleware/upload');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/profile', authMiddleware, userController.getUserProfile);
router.get('/uploader-profile/:user_id', authMiddleware, userController.getUserById);
router.put('/profile/edit', authMiddleware, upload("profile_picture").single("profile_picture"), userController.editUserProfile);


module.exports = router;
