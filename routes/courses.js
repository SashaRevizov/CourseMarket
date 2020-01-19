const { Router } = require('express');
const coursesController = require('../controllers/courses');
const { courseValidators } = require('../utils/validators');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', coursesController.getCourses);
router.get('/:id/edit', auth, coursesController.getCourseEdit);
router.get('/:id', auth, coursesController.getCourse);
router.post('/edit', courseValidators, auth, coursesController.courseEdit);
router.post('/remove', auth, coursesController.removeCourse);
module.exports = router;
