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

    if (!book) {
      return res.status(400).json({ message: 'Invalid book' });
    }

    // Create a new order
    const order = await Order.create({
      book_id,
      buyer_id,
      seller_id: book.user_id,
      is_confirmed: false,
    });

    res.json({ message: 'Order placed successfully', order });
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
      include: [{ model: Book, as: 'Book' }],
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReceivedOrders = async (req, res) => {
  const seller_id = req.user.user_id; // Assuming you have user information in req.user

  try {
    // Fetch all orders received by the user as a seller
    const orders = await Order.findAll({
      where: { seller_id },
      include: [{ model: Book, as: 'Book' }],
    });

    res.json(orders);
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
    // Update order status to 'confirmed'
    order.is_confirmed = true;
    await order.save();

    // Update book's user_id to buyer's user_id
    const book = await Book.findByPk(order.book_id);
    book.user_id = order.buyer_id;
    await book.save();

    res.json({ message: 'Order confirmed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
