const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authmiddleware = require('../middleware/authmiddleware');

router.post('/place-order',authmiddleware, orderController.placeOrder);
router.get('/user-orders',authmiddleware, orderController.getPlacedOrders);
router.get('/received-orders',authmiddleware, orderController.getReceivedOrders);
router.post('/confirm-order/:order_id',authmiddleware, orderController.confirmOrder);
router.post('/discard-order/:order_id',authmiddleware, orderController.discardOrder);

module.exports = router;
 