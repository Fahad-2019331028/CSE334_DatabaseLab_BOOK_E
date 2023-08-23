const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authmiddleware');

const router = express.Router();

router.post('/add-review/:user_id', authMiddleware, reviewController.addReview);
router.get('/reviews/:user_id', reviewController.getReviewsByRecipient);

module.exports = router;