require('dotenv').config();
const express        = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser   = require('cookie-parser');
const session        = require('express-session');
const flash          = require('connect-flash');
const morgan         = require('morgan');
const path           = require('path');
const connectDB      = require('./config/db');

const app = express();

// Connect MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session (required for connect-flash)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Flash messages
app.use(flash());

// Global locals — always available in every EJS template
app.use((req, res, next) => {
  res.locals.user    = null;
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.info    = req.flash('info');
  next();
});

// Soft-load logged-in user on every request (overwrites res.locals.user if token valid)
const { loadUser } = require('./public/js/auth');
app.use(loadUser);

// Routes
app.use('/', require('./routes/viewRoutes'));
app.use('/auth', require('./routes/authRoutes'));

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', { title: '404 — Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SnippetVault running → http://localhost:${PORT}`);
});
