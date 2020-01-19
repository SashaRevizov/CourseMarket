module.exports = (req, res, next) => {
  res.locals.isAuth = req.session.isAuthenticate;
  res.locals.csrf = req.csrfToken();
  next();
};
