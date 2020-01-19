const { Router } = require('express');
const profileController = require('../controllers/profile');
const router = Router();

router.get('/', profileController.getProfile);
router.post('/', profileController.editProfile);

module.exports = router;
