const { Router } = require('express');
const authController = require('../controllers/auth');
const validators = require('../utils/validators');
const router = Router();

router.get('/login', authController.getAuth);
router.post('/login', validators.loginValidator, authController.login);
router.post('/register', validators.registerValidators, authController.register);
router.get('/logout', authController.logout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.resetMail);
router.get('/password/:token', authController.getPassword);
router.post('/password', authController.setPassword);
module.exports = router;
