//NOTE: We have used sequelize for better security and sanitization. But we have also done this with raw SQL queries. We have added the raw sql query implementation below commented

const db=require('../models/database')

const Order=db.orders
const Book=db.books
const User=db.users

exports.placeOrder = async (req, res) => {
  const { book_id } = req.body;
  console.log(req.user);
  const buyer_id = req.user.user_id; 

  try {
    const book = await Book.findByPk(book_id);
    const orders = await Order.findOne({ where: { book_id,buyer_id }});
    console.log(orders)
    if (!book) {
      return res.status(400).json({ message: 'Invalid book' });
    }
    if (book.transaction) {
      return res.status(400).json({ message: 'The book is already transacted' });
    }
    
    if (!orders) {
      const order = await Order.create({
        book_id,
        buyer_id,
        seller_id: book.user_id,
        is_confirmed: false,
      });

      res.json({ message: 'Order placed successfully', order });
    }
    else
    {
      const order=null
      res.json({ message: 'Order Already Placed',order });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 


exports.getPlacedOrders = async (req, res) => {
  const buyer_id = req.user.user_id;

  try {
    const orders = await Order.findAll({
      where: { buyer_id },
      include: [{ model: Book, as: 'Book' }], 
    });
    console.log(orders)
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getReceivedOrders = async (req, res) => {
  const seller_id = req.user.user_id; 

  try {
    const receivedOrders = await Order.findAll({
      where: { seller_id },
      include: [{ model: Book, as: 'Book' }],
    });

    res.json({ receivedOrders});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.confirmOrder = async (req, res) => {
  const { order_id } = req.params;
  const seller_id = req.user.user_id; 

  try {
    const order = await Order.findByPk(order_id);
    const book = await Book.findByPk(order.book_id);
    if (!order) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (order.seller_id !== seller_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.is_confirmed) {
      return res.status(400).json({ message: 'Order is already confirmed' });
    }
    if (book.transaction) {
      return res.status(400).json({ message: 'Book already transacted' });
    }
    order.is_confirmed = 1;
    await order.save();

    book.transaction = true;
    await book.save();

    res.json({ message: 'Order confirmed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.discardOrder = async (req, res) => {
  const { order_id } = req.params;
  const seller_id = req.user.user_id;

  try {
    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (order.seller_id !== seller_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.is_confirmed) {
      return res.status(400).json({ message: 'Order is already confirmed or Discarded' });
    }
    order.is_confirmed = 2;
    await order.save();

    res.json({ message: 'Order discarded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


//Raw Sql Query Impementation

// const db = require('../models/database');
// const sequelize = db.sequelize;
// const Order = db.orders;
// const Book = db.books;
// const User = db.users;

// exports.placeOrder = async (req, res) => {
//   const { book_id } = req.body;
//   const buyer_id = req.user.user_id;

//   try {
//     const getBookQuery = `
//       SELECT * FROM books WHERE book_id = ?
//     `;
//     const [book] = await sequelize.query(getBookQuery, {
//       replacements: [book_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!book) {
//       return res.status(400).json({ message: 'Invalid book' });
//     }

//     if (book.transaction) {
//       return res.status(400).json({ message: 'The book is already transacted' });
//     }

//     const getOrderQuery = `
//       SELECT * FROM orders WHERE book_id = ? AND buyer_id = ?
//     `;
//     const [existingOrder] = await sequelize.query(getOrderQuery, {
//       replacements: [book_id, buyer_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!existingOrder) {
//       const addOrderQuery = `
//         INSERT INTO orders (book_id, buyer_id, seller_id, is_confirmed)
//         VALUES (?, ?, ?, ?)
//       `;
//       await sequelize.query(addOrderQuery, {
//         replacements: [book_id, buyer_id, book.user_id, false],
//         type: sequelize.QueryTypes.INSERT
//       });

//       res.json({ message: 'Order placed successfully' });
//     } else {
//       res.json({ message: 'Order Already Placed' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getPlacedOrders = async (req, res) => {
//   const buyer_id = req.user.user_id;

//   try {
//     const getOrdersQuery = `
//       SELECT orders.*, books.*
//       FROM orders
//       INNER JOIN books ON orders.book_id = books.book_id
//       WHERE orders.buyer_id = ?
//     `;
//     const orders = await sequelize.query(getOrdersQuery, {
//       replacements: [buyer_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     res.json(orders);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Implement the rest of the functions for received orders, confirm order, discard order...


// // orderController.js

// // orderController.js

// exports.getReceivedOrders = async (req, res) => {
//   const seller_id = req.user.user_id;

//   try {
//     const getReceivedOrdersQuery = `
//       SELECT orders.*, books.*
//       FROM orders
//       INNER JOIN books ON orders.book_id = books.book_id
//       WHERE orders.seller_id = ?
//     `;
//     const receivedOrders = await sequelize.query(getReceivedOrdersQuery, {
//       replacements: [seller_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     res.json(receivedOrders);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.confirmOrder = async (req, res) => {
//   const { order_id } = req.params;
//   const seller_id = req.user.user_id;

//   try {
//     const getOrderQuery = `
//       SELECT * FROM orders WHERE order_id = ?
//     `;
//     const [order] = await sequelize.query(getOrderQuery, {
//       replacements: [order_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!order) {
//       return res.status(400).json({ message: 'Invalid order ID' });
//     }

//     if (order.seller_id !== seller_id) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     if (order.is_confirmed) {
//       return res.status(400).json({ message: 'Order is already confirmed' });
//     }

//     const updateOrderQuery = `
//       UPDATE orders SET is_confirmed = 1 WHERE order_id = ?
//     `;
//     await sequelize.query(updateOrderQuery, {
//       replacements: [order_id],
//       type: sequelize.QueryTypes.UPDATE
//     });

//     const updateBookQuery = `
//       UPDATE books SET transaction = true WHERE book_id = ?
//     `;
//     await sequelize.query(updateBookQuery, {
//       replacements: [order.book_id],
//       type: sequelize.QueryTypes.UPDATE
//     });

//     res.json({ message: 'Order confirmed successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.discardOrder = async (req, res) => {
//   const { order_id } = req.params;
//   const seller_id = req.user.user_id;

//   try {
//     const getOrderQuery = `
//       SELECT * FROM orders WHERE order_id = ?
//     `;
//     const [order] = await sequelize.query(getOrderQuery, {
//       replacements: [order_id],
//       type: sequelize.QueryTypes.SELECT
//     });

//     if (!order) {
//       return res.status(400).json({ message: 'Invalid order ID' });
//     }

//     if (order.seller_id !== seller_id) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }

//     if (order.is_confirmed) {
//       return res.status(400).json({ message: 'Order is already confirmed or discarded' });
//     }

//     const updateOrderQuery = `
//       UPDATE orders SET is_confirmed = 2 WHERE order_id = ?
//     `;
//     await sequelize.query(updateOrderQuery, {
//       replacements: [order_id],
//       type: sequelize.QueryTypes.UPDATE
//     });

//     res.json({ message: 'Order discarded successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
// // module.exports = exports;
