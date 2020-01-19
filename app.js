const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const helmet = require('helmet');
const path = require('path');
const flash = require('connect-flash');
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const cartRoutes = require('./routes/cart');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const ordersRouter = require('./routes/orders');
const keys = require('./config');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorMiddleware = require('./middleware/error');
const fileMiddleware = require('./middleware/file');
const app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helpers')
});

mongoose.connect(keys.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, err => {
  if (err) console.log(err);
  console.log('Connected to DB');
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const store = new MongoSession({
  uri: keys.MONGO_URL,
  collection: 'sessions'
});

app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
  })
);
app.use(helmet());
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/cart', cartRoutes);
app.use('/courses', coursesRoutes);
app.use('/auth', authRouter);
app.use('/orders', ordersRouter);
app.use('/profile', profileRouter);
app.use(errorMiddleware);
module.exports = app;
