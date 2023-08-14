const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const multer = require('multer');
const auth = require('../middleware/authmiddleware');
const bookController = require('../controllers/bookController');
const authmiddleware = require('../middleware/authmiddleware');
const upload = require('../middleware/upload');
  
router.post('/add',authmiddleware,upload("book_img_url").single("book_img_url"), bookController.addBook);
router.get('/search', bookController.searchBooks);
router.get('/filter', bookController.filterBooks);
router.get('/allbooks', bookController.getAllBooks);
// router.get('/:id', bookController.getBookById);
// router.post('/', bookController.addBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);
module.exports = router;
