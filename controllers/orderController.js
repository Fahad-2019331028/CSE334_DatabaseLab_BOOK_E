const db=require('../models/database')

const Order=db.orders
const Book=db.books
const User=db.users

exports.placeOrder = async (req, res) => {
  const { book_id } = req.body;
  console.log(req.user);
  const buyer_id = req.user.user_id; // Assuming you have user information in req.user

  try {
    // Check if the book exists
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
    // Create a new order
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
  const buyer_id = req.user.user_id; // Assuming you have user information in req.user

  try {
    // Fetch all orders placed by the user
    const orders = await Order.findAll({
      where: { buyer_id },
      include: [{ model: Book, as: 'Book' }], // Include the associated Book
    });
    console.log(orders)
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// orderController.js

// orderController.js

exports.getReceivedOrders = async (req, res) => {
  const seller_id = req.user.user_id; // Assuming you have user information in req.user

  try {
    // Convert page and perPage to integers
    // Fetch received orders for the current page
    const receivedOrders = await Order.findAll({
      where: { seller_id },
      include: [{ model: Book, as: 'Book' }],
    });

    // Fetch total count of received orders for pagination
    // Calculate total pages

    res.json({ receivedOrders});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.confirmOrder = async (req, res) => {
  const { order_id } = req.params;
  const seller_id = req.user.user_id; // Assuming you have user information in req.user

  try {
    // Fetch the order to confirm
    const order = await Order.findByPk(order_id);
    const book = await Book.findByPk(order.book_id);
    if (!order) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Verify that the logged-in user is the seller of the order
    if (order.seller_id !== seller_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.is_confirmed) {
      return res.status(400).json({ message: 'Order is already confirmed' });
    }
    if (book.transaction) {
      return res.status(400).json({ message: 'Book already transacted' });
    }
    // Update order status to 'confirmed'
    order.is_confirmed = 1;
    await order.save();

    // Update book's user_id to buyer's user_id
    book.user_id = order.buyer_id;
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
  const seller_id = req.user.user_id; // Assuming you have user information in req.user

  try {
    // Fetch the order to discard
    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Verify that the logged-in user is the seller of the order
    if (order.seller_id !== seller_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.is_confirmed) {
      return res.status(400).json({ message: 'Order is already confirmed or Discarded' });
    }
    // Update order status to 'discarded'
    order.is_confirmed = 2;
    await order.save();

    res.json({ message: 'Order discarded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

