const Course = require('../models/course');
const { validationResult } = require('express-validator/check');

isOwner = (course, req) => {
  return course.userId.toString() === req.user._id.toString();
};

module.exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('userId', 'email name')
      .select('price title img');
    res.render('courses', {
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
      title: 'Курсы'
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports.getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.render('course', {
    layout: 'empty',
    title: course.title,
    course
  });
};

module.exports.getCourseEdit = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!isOwner(course, req)) {
      return res.redirect('courses');
    }

    res.render('course-edit', {
      title: `Редактировать ${course.title}`,
      course
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports.courseEdit = async (req, res) => {
  try {
    const { id, title, price, img } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).redirect(`/${id}/edit?allow=true`);
    }

    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    await Course.findByIdAndUpdate(id, { title, price, img });
    res.redirect('/courses');
  } catch (e) {
    console.log(e);
  }
};

module.exports.removeCourse = async (req, res) => {
  try {
    await Course.deleteOne({ _id: req.body.id, userId: req.user._id });
    res.redirect('/courses');
  } catch (e) {
    console.log(e);
  }
};
