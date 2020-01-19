const { Router } = require('express');
const auth = require('../middleware/auth');
const ordersController = require('../controllers/orders');

const router = Router();

router.get('/', auth, ordersController.getOrders);
router.post('/', auth, ordersController.createOrder);
module.exports = router;
