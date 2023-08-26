//NOTE: We have used sequelize for better security and sanitization. But we have also done this with raw SQL queries. We have added the raw sql query implementation below commented

const db=require('../models/database')
const User=db.users
const Book=db.books
const { Op } = require('sequelize');
const Order = require('../models/Order');
const e = require('express');
exports.getAllBooks = async (req, res) => {
  const page = req.query.page || 1; 
  try {
    const { rows: books } = await Book.findAndCountAll({
      where: {
        transaction: false, // Excluding the books which has been trasacted
      },
      include: {
        model: User,
        as: 'User',
        attributes: ['username'],
      },
      attributes: ['book_id', 'title', 'author', 'genre', 'book_condition', 'is_for_sale', 'is_for_giveaway', 'is_for_loan', 'price', 'book_img_url'], // Add more attributes as needed
    });

    res.json({ books});
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
        transaction: false,
      },
    };

    const books = await Book.findAll(query);

    return res.status(200).json(books);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.filterBooks = async (req, res) => {
  try {
    console.log("Filtering")
    const filters = req.query;
    const whereClause = {};
    const orderClause = [];
    console.log(filters)

    if (filters.genre) {
      whereClause.genre = filters.genre;
    }
    whereClause.transaction=false
    if (filters.book_type) {
      if (filters.book_type === "Giveaway") {
        whereClause.is_for_giveaway = true;
      } else if (filters.book_type === "Loan") {
        whereClause.is_for_loan = true;
      } else if (filters.book_type === "Price High to Low") {
        orderClause.push(["price", "ASC"]);
      }
    }

    if (filters.sort === "A to Z") {
      orderClause.push(["title", "ASC"]);
    } else if (filters.sort === "Z to A") {
      orderClause.push(["title", "DESC"]);
    }

    const filteredBooks = await Book.findAll({
      where: whereClause,
      order: orderClause,
    });
    console.log(filteredBooks)
    res.json(filteredBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error filtering books" });
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




exports.addBook = async (req, res) => {
  try {
    console.log("Inside add")
    const user_id = req.user.user_id; 

    const {
      title,
      author,
      genre,
      description,
      book_img_url,
      book_condition,
      book_type,
      price,
    } = req.body;
    console.log(req.body)

    let is_for_sale = false;
    let is_for_loan = false;
    let is_for_giveaway = false;

    if (book_type === "Sale") {
      is_for_sale = true;
    } else if (book_type === "Loan") {
      is_for_loan = true;
    } else {
      is_for_giveaway = true;
    }

    let finalPrice = null;
    if (price !== undefined && price !== null && price !== '') {
      finalPrice = price;
    }

    let transaction=false
    const book = await Book.create({
      title,
      author,
      description,
      book_condition,
      price: finalPrice,
      user_id: user_id,
      is_for_sale,
      is_for_loan,
      is_for_giveaway,
      genre,
      book_img_url,
      transaction,
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
  const { id } = req.params; 

  try {

    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    await book.destroy();

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByPk(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = req.body.title || book.title;
    book.author = req.body.author || book.author;
    await book.save();

    res.json(book); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getBookById = async (req, res) => {
  const { book_id } = req.params; 
  console.log(book_id)
  console.log("Finding the book")
  try {
    const book = await Book.findOne({
      where: { book_id },
      include: { model: User, as: 'User', attributes: ['username'] },
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    console.log(book) 
    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBooksById = async (req, res) => {
  const { user_id } = req.params; 

  try {
    const books = await Book.findAll({
      where: { user_id }, 
      include: { model: User, as: 'User', attributes: ['username'] },
    });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  const { book_id } = req.params;
  console.log("Finding Uploader")
  try {
    const book = await Book.findOne({ where: { book_id } });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const user = await User.findByPk(book.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(user)    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


//Raw Sql Query Impementation

// const db = require('../models/database');
// const sequelize = db.sequelize;
// const Book = db.books;
// const User = db.users;
// const { Op } = require('sequelize');

// exports.getAllBooks = async (req, res) => {
//   const page = req.query.page || 1;

//   try {
//     const offset = (page - 1) * 10;
//     const getAllBooksQuery = `
//       SELECT b.book_id, b.title, b.author, b.genre, b.book_condition, b.is_for_sale, b.is_for_giveaway, b.is_for_loan, 
//         b.price, b.book_img_url, u.username 
//       FROM books AS b
//       LEFT JOIN users AS u ON b.user_id = u.user_id
//       WHERE b.transaction = 0
//       LIMIT 10 OFFSET ${offset}
//     `;
//     const books = await sequelize.query(getAllBooksQuery, { type: sequelize.QueryTypes.SELECT });

//     res.json({ books });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.searchBooks = async (req, res) => {
//   try {
//     const { searchQuery } = req.query;
//     const searchBooksQuery = `
//       SELECT * FROM books WHERE title LIKE ?
//     `;
//     const books = await sequelize.query(searchBooksQuery, {
//       replacements: [`%${searchQuery}%`],
//       type: sequelize.QueryTypes.SELECT
//     });

//     res.status(200).json(books);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.filterBooks = async (req, res) => {
//   try {
//     const filters = req.query;
//     const whereClause = [];
//     const orderClause = [];

//     if (filters.genre) {
//       whereClause.push(`genre = '${filters.genre}'`);
//     }
//     whereClause.push('transaction = 0');

//     if (filters.book_type) {
//       if (filters.book_type === 'Giveaway') {
//         whereClause.push('is_for_giveaway = 1');
//       } else if (filters.book_type === 'Loan') {
//         whereClause.push('is_for_loan = 1');
//       } else if (filters.book_type === 'Price High to Low') {
//         orderClause.push('price ASC');
//       }
//     }

//     if (filters.sort === 'A to Z') {
//       orderClause.push('title ASC');
//     } else if (filters.sort === 'Z to A') {
//       orderClause.push('title DESC');
//     }

//     const filterBooksQuery = `
//       SELECT * FROM books
//       WHERE ${whereClause.join(' AND ')}
//       ORDER BY ${orderClause.join(', ')}
//     `;
//     const filteredBooks = await sequelize.query(filterBooksQuery, {
//       type: sequelize.QueryTypes.SELECT
//     });

//     res.json(filteredBooks);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error filtering books' });
//   }
// };

// exports.getOrderableBooks = async (req, res) => {
//   try {
//     const { filter } = req.query;
//     const getOrderableBooksQuery = `
//       SELECT b.book_id, b.title, b.author, b.genre, b.book_condition, b.is_for_sale, b.is_for_giveaway, b.is_for_loan, 
//         b.price, b.book_img_url, u.username 
//       FROM books AS b
//       LEFT JOIN users AS u ON b.user_id = u.user_id
//       WHERE b.${filter} = 1
//     `;
//     const books = await sequelize.query(getOrderableBooksQuery, { type: sequelize.QueryTypes.SELECT });

//     res.json(books);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.addBook = async (req, res) => {
//   try {
//     const user_id = req.user.user_id;
//     const {
//       title,
//       author,
//       genre,
//       description,
//       book_img_url,
//       book_condition,
//       book_type,
//       price,
//     } = req.body;

//     let is_for_sale = 0;
//     let is_for_loan = 0;
//     let is_for_giveaway = 0;

//     if (book_type === 'Sale') {
//       is_for_sale = 1;
//     } else if (book_type === 'Loan') {
//       is_for_loan = 1;
//     } else {
//       is_for_giveaway = 1;
//     }

//     const addBookQuery = `
//       INSERT INTO books (title, author, genre, description, book_img_url, book_condition, 
//         is_for_sale, is_for_loan, is_for_giveaway, price, user_id, transaction)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
//     `;
//     await sequelize.query(addBookQuery, {
//       replacements: [
//         title,
//         author,
//         genre,
//         description,
//         book_img_url,
//         book_condition,
//         is_for_sale,
//         is_for_loan,
//         is_for_giveaway,
//         price,
//         user_id,
//       ],
//       type: sequelize.QueryTypes.INSERT
//     });

//     res.status(201).json({ message: 'Book added successfully' });
//   } catch (error) {
//     console.error(error);

//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({ message: 'Validation error. Please check your inputs.' });
//     }

//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.deleteBook = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const getBookQuery = `
//       SELECT * FROM books WHERE book_id = ?
//     `;
//     const [book] = await sequelize.query(getBookQuery, {
//       replacements: [id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }

//     const deleteBookQuery = `
//       DELETE FROM books WHERE book_id = ?
//     `;
//     await sequelize.query(deleteBookQuery, {
//       replacements: [id],
//       type: sequelize.QueryTypes.DELETE
//     });

//     res.json({ message: 'Book deleted successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.updateBook = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const getBookQuery = `
//       SELECT * FROM books WHERE book_id = ?
//     `;
//     const [book] = await sequelize.query(getBookQuery, {
//       replacements: [id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }

//     const updatedBook = {
//       title: req.body.title || book.title,
//       author: req.body.author || book.author,
//       genre: req.body.genre || book.genre,
//       description: req.body.description || book.description,
//       book_img_url: req.body.book_img_url || book.book_img_url,
//       book_condition: req.body.book_condition || book.book_condition,
//       is_for_sale: req.body.is_for_sale || book.is_for_sale,
//       is_for_loan: req.body.is_for_loan || book.is_for_loan,
//       is_for_giveaway: req.body.is_for_giveaway || book.is_for_giveaway,
//       price: req.body.price || book.price,
//     };

//     const updateBookQuery = `
//       UPDATE books 
//       SET title = ?, author = ?, genre = ?, description = ?, book_img_url = ?, 
//         book_condition = ?, is_for_sale = ?, is_for_loan = ?, is_for_giveaway = ?, price = ?
//       WHERE book_id = ?
//     `;
//     await sequelize.query(updateBookQuery, {
//       replacements: [
//         updatedBook.title,
//         updatedBook.author,
//         updatedBook.genre,
//         updatedBook.description,
//         updatedBook.book_img_url,
//         updatedBook.book_condition,
//         updatedBook.is_for_sale,
//         updatedBook.is_for_loan,
//         updatedBook.is_for_giveaway,
//         updatedBook.price,
//         id,
//       ],
//       type: sequelize.QueryTypes.UPDATE
//     });

//     res.json(updatedBook);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getBookById = async (req, res) => {
//   const { book_id } = req.params;

//   try {
//     const getBookQuery = `
//       SELECT * FROM books WHERE book_id = ?
//     `;
//     const [book] = await sequelize.query(getBookQuery, {
//       replacements: [book_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }

//     res.json(book);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getBooksById = async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     const getBooksQuery = `
//       SELECT * FROM books WHERE user_id = ?
//     `;
//     const userBooks = await sequelize.query(getBooksQuery, {
//       replacements: [user_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     res.json(userBooks);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getOwnedBooks = async (req, res) => {
//   const user_id = req.user.user_id;

//   try {
//     const getOwnedBooksQuery = `
//       SELECT * FROM books WHERE user_id = ?
//     `;
//     const ownedBooks = await sequelize.query(getOwnedBooksQuery, {
//       replacements: [user_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     res.json(ownedBooks);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = exports;

