const express = require('express');
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();

router.post('/add-rating/:user_id', authMiddleware, ratingController.addRating);
router.get('/ratings/:user_id', ratingController.getRatingsAndAverageByRecipient);

module.exports = router;