const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authmiddleware = require('../middleware/authmiddleware');

// Route to place an order
router.post('/place-order',authmiddleware, orderController.placeOrder);

// Route to view user's placed orders
router.get('/user-orders/:user_id',authmiddleware, orderController.getPlacedOrders);

// Route to view user's received orders
router.get('/received-orders/:user_id',authmiddleware, orderController.getReceivedOrders);

// Route to confirm an order
router.post('/confirm-order/:order_id',authmiddleware, orderController.confirmOrder);

module.exports = router;
 