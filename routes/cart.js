const { Router } = require('express');
const cartController = require('../controllers/cart');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, cartController.getCart);
router.post('/add', auth, cartController.addToCart);
router.delete('/remove/:id', auth, cartController.removeFromCart);

module.exports = router;
