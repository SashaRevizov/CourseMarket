const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');
const User = require('../models/user');
const keys = require('../config');

sgMail.setApiKey(keys.SEND_GRID_KEY);

module.exports.getAuth = (req, res) => {
  res.render('auth/login', {
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  });
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('loginError', errors.array()[0].msg);
      res.status(422).redirect('/auth/login#login');
    }
    const candidate = await User.findOne({ email });
    const compare = await bcrypt.compare(password, candidate.password);
    if (compare) {
      req.session.isAuthenticate = true;
      req.session.user = candidate;
      req.session.save(err => {
        if (err) throw err;
        res.redirect('/');
      });
    } else {
      req.flash('loginError', 'Неверный пароль');
      res.redirect('/auth/login#login');
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashed,
      cart: { items: [] }
    });

    await user.save();

    res.redirect('/auth/login#login');
    await sgMail.send({
      from: keys.MAIL,
      to: email,
      subject: 'Регистрация на сайте',
      html: `
          <h1>Добро пожаловать</h1>
          <hr/>
          <a href="${keys.MAIN_URL}">Наш сайт</a>
        `
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};

module.exports.getReset = (req, res) => {
  res.render('auth/reset', {
    error: req.flash('error')
  });
};

module.exports.resetMail = async (req, res) => {
  try {
    const candidate = await User.findOne({ email: req.body.email });
    if (candidate) {
      crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
          req.flash('loginError', 'Повторите попытку');
          return res.redirect('/auth/login#login');
        }
        const token = buffer.toString('hex');
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await sgMail.send({
          from: keys.MAIL,
          to: candidate.email,
          subject: 'Запрос на восстановление пароля',
          html: `
            <h1>Здравствуйте! Для восстановления пароля на сайте перейдите по ссылке:</h1>
            <a href="${keys.MAIN_URL}/auth/password/${token}">Восстановить</a>
            <hr/>
            <a href="${keys.MAIN_URL}">Наш сайт</a>
          `
        });
        res.redirect('/auth/login#login');
      });
    } else {
      req.flash('error', 'Неверный email');
      return res.redirect('/auth/reset');
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.getPassword = async (req, res) => {
  try {
    if (!req.params.token) {
      return res.redirect('/auth/login#login');
    }
    const candidate = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }
    });

    if (candidate) {
      res.render('auth/password', {
        title: 'Восстановление пароля',
        error: req.flash('error'),
        userId: candidate._id,
        token: req.params.token
      });
    } else {
      req.flash('errorLogin', 'Время действия токена закончено');
      res.redirect('/auth/login#login');
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.setPassword = async (req, res) => {
  try {
    const candidate = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token
    });
    if (candidate) {
      candidate.password = await bcrypt.hash(req.body.password, 10);
      candidate.resetToken = undefined;
      candidate.resetTokenExp = undefined;
      await candidate.save();
      res.redirect('/auth/login#login');
    } else {
      res.redirect('/auth/login#login');
    }
  } catch (e) {
    console.log(e);
  }
};
