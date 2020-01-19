const { Router } = require('express');
const addController = require('../controllers/add');
const { courseValidators } = require('../utils/validators');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, addController.getAdd);
router.post('/', auth, courseValidators, addController.addCourse);

module.exports = router;
