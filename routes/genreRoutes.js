const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

router.post('/add', genreController.addGenre);
router.get('/all',genreController.getAllGenres);
module.exports = router;
