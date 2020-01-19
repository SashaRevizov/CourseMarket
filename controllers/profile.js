const User = require('../models/user');
module.exports.getProfile = (req, res) => {
  res.render('profile', {
    title: 'Профиль',
    isProfile: true,
    user: req.user.toObject()
  });
};

module.exports.editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const toChange = {
      name: req.body.name
    };

    if (req.file) {
      toChange.avatarUrl = req.file.path;
    }

    Object.assign(user, toChange);
    await user.save();
    res.redirect('/profile');
  } catch (e) {
    console.log(e);
  }
};
