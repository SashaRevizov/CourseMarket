const Course = require('../models/course');

const filterCourses = cart => {
  return cart.items.map(c => ({ ...c.courseId._doc, count: c.count }));
};

const computePrice = courses => {
  return courses.reduce((total, course) => {
    return (total += course.count * course.price);
  }, 0);
};

module.exports.addToCart = async (req, res) => {
  try {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/cart');
  } catch (e) {
    console.log(e);
  }
};

module.exports.getCart = async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId').execPopulate();
    const courses = filterCourses(user.cart);

    res.render('cart', {
      title: 'Корзина',
      isCard: true,
      price: computePrice(courses),
      courses
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports.removeFromCart = async (req, res) => {
  try {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId').execPopulate();
    const courses = filterCourses(user.cart);
    res.status(200).json({ courses, price: computePrice(courses) });
  } catch (e) {
    console.log(e);
  }
};
