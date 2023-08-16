const db=require('../models/database')
const User=db.users
const Book=db.books
const { Op } = require('sequelize');
// const Book = require('../models/Book');
// const User = require('../models/User');
const Order = require('../models/Order');
exports.getAllBooks = async (req, res) => {
  const page = req.query.page || 1; // Get the requested page from query parameters
  const booksPerPage = 10; // Number of books per page

  try {
    const { count, rows: books } = await Book.findAndCountAll({
      include: {
        model: User,
        as: 'User',
        attributes: ['username'],
      },
      attributes: ['book_id', 'title', 'author', 'genre', 'book_condition', 'is_for_sale', 'is_for_giveaway', 'is_for_loan', 'price', 'book_img_url'], // Add more attributes as needed
      limit: booksPerPage,
      offset: (page - 1) * booksPerPage,
    });

    const totalPages = Math.ceil(count / booksPerPage);
    
    // Modify book_type based on is_for_sale, is_for_giveaway, and is_for_loan attributes
    // const modifiedBooks = books.map((book) => {
    //   if (book.price) {
    //     return {
    //       ...book.toJSON(),
    //       book_type: `Price: ${book.price}` // Display price for sale books
    //     };
    //   } else if (book.is_for_giveaway) {
    //     return {
    //       ...book.toJSON(),
    //       book_type: 'Giveaway'
    //     };
    //   } else if (book.is_for_loan) {
    //     return {
    //       ...book.toJSON(),
    //       book_type: 'Loan'
    //     };
    //   }
    //   return book.toJSON(); // Return unchanged book if no conditions match
    // });
    // console.log(modifiedBooks)
    res.json({ books, totalPages, currentPage: page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.searchBooks = async (req, res) => {
  try {
    const { searchQuery } = req.query;
    console.log(searchQuery);

    const query = {
      where: {
        title: { [Op.like]: `%${searchQuery}%` },
      },
    };

    const books = await Book.findAll(query);

    return res.status(200).json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// const Book = require('../models/Book'); // Import the Book model
exports.filterBooks = async (req, res) => {
  try {
    const { sort, genre, bookType } = req.query;
    let query = {};

    if (!sort && !genre && !bookType) {
      return res.status(400).json({ message: 'Please select at least one filter option' });
    }

    if (sort) {
      if (sort === 'a_to_z') {
        query.order = [['title', 'ASC']];
      } else if (sort === 'z_to_a') {
        query.order = [['title', 'DESC']];
      }
    }

    if (genre) {
      let genreFilter;

      switch (genre) {
        case 'crime':
          genreFilter = 'Crime';
          break;
        case 'thriller':
          genreFilter = 'Thriller';
          break;
        case 'drama':
          genreFilter = 'Drama';
          break;
        case 'fantasy':
          genreFilter = 'Fantasy';
          break;
        case 'sci_fi':
          genreFilter = 'Science Fiction';
          break;
        // Add more cases for other genres if needed
        default:
          // Handle invalid genre value
          return res.status(400).json({ message: 'Invalid genre value' });
      }

      query.where = {
        ...query.where,
        genre: genreFilter,
      };
    }

    if (bookType) {
      if (bookType === 'price_high_to_low') {
        query.order = [['price', 'DESC']];
      } else if (bookType === 'giveaway') {
        query.where = { is_for_giveaway: true };
      } else if (bookType === 'loan') {
        query.where = { is_for_loan: true };
      }
    }

    const books = await Book.findAll(query);

    return res.status(200).json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.getOrderableBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: {
        [req.query.filter]: true,
      },
      include: [{ model: User, as: 'User', attributes: ['username'] }],
    });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getBookById = async (req, res) => {
  const user_id = req.params.user_id;

  try {
    const books = await Book.findAll({
      where: { user_id }, // Filter books by user_id
      include: { model: User, as: 'User', attributes: ['username'] },
    });

    if (!books || books.length === 0) {
      return res.status(404).json({ message: 'No books found for the user' });
    }

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addBook = async (req, res) => {
  try {
    const user_id = req.user.user_id; // Assuming you have user authentication implemented

    const {
      title,
      author,
      description,
      book_condition,
      edition,
      price,
      is_for_sale,
      is_for_loan,
      is_for_giveaway,
      genre,
    } = req.body;
    console.log(req.body)
    if (!title || !author || !description || !book_condition || !edition) {
      return res.status(400).json({ message: 'Please fill out all required fields.' });
    }
    let book_img_url
    if(req.file)
    {
      book_img_url=req.file.path
      console.log(req.file.path)
    }
    // let bookImage;
    // if (req.file) {
    //   // Handle uploaded image 
    //   bookImage = req.file.filename;
    // }

    const book = await Book.create({
      title,
      author,
      description,
      book_condition,
      edition,
      price,
      user_id: user_id,
      is_for_sale,
      is_for_loan,
      is_for_giveaway,
      genre,
      book_img_url: book_img_url,
    });

    return res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    console.error(error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error. Please check your inputs.' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteBook = async (req, res) => {
  const { id } = req.params; // Get the book ID from URL parameters

  try {
    // Find the book by ID
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete the book from the database
    await book.destroy();

    res.json({ message: 'Book deleted successfully' }); // Send the success message as the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBook = async (req, res) => {
  const { id } = req.params; // Get the book ID from URL parameters

  try {
    // Find the book by ID
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update the book attributes based on the request body
    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    // ... update other attributes as needed ...

    // Save the updated book in the database
    await book.save();

    res.json(book); // Send the updated book data as the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
