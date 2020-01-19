const Course = require('../models/course');
const { validationResult } = require('express-validator/check');
module.exports.getAdd = (req, res) => {
  res.render('add', {
    isAdd: true,
    title: 'Новый курс'
  });
};

module.exports.addCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('add', {
        isAdd: true,
        title: 'Новый курс',
        error: errors.array()[0].msg,
        data: {
          title: req.body.title,
          price: req.body.price,
          img: req.body.img
        }
      });
    }
    const course = new Course({
      title: req.body.title,
      price: req.body.price,
      img: req.body.img,
      userId: req.user._id
    });

    await course.save();
    res.redirect('/courses');
  } catch (e) {
    console.log(e);
  }
};
