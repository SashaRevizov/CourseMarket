const Order = require('../models/order');

module.exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id }).populate('user.userId');
    res.render('orders', {
      isOrder: true,
      title: 'Заказы',
      orders: orders.map(o => {
        return {
          ...o._doc,
          price: o.courses.reduce((total, c) => {
            return (total += c.count * c.course.price);
          }, 0)
        };
      })
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports.createOrder = async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.courseId').execPopulate();
    const courses = user.cart.items.map(c => ({ count: c.count, course: { ...c.courseId._doc } }));
    const order = new Order({
      courses,
      user: {
        name: req.user.name,
        userId: req.user
      }
    });
    await order.save();
    await req.user.clearCart();
    res.redirect('/orders');
  } catch (e) {
    console.log(e);
  }
};
