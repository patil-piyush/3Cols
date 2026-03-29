require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');


const helmet = require('helmet');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://code.jquery.com"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com"
        ],

        fontSrc: [
          "'self'",
          "https://cdnjs.cloudflare.com",
          "https://fonts.gstatic.com"
        ],

        imgSrc: ["'self'", "data:"],

        connectSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com"
        ],

        objectSrc: ["'none'"]
      }
    }
  })
);

// Rate limiting for auth routes
const rateLimit = require('express-rate-limit');

app.use('/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));



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

// Global locals - always available in every EJS template
app.use((req, res, next) => {
  res.locals.user = null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  next();
});

// Show footer on specific routes
app.use((req, res, next) => {
  res.locals.showFooter = false;
  next();
});

// Soft-load logged-in user on every request (overwrites res.locals.user if token valid)
const { loadUser } = require('./middleware/auth');
app.use(loadUser);

// Routes
app.use('/', require('./routes/viewRoutes'));
app.use('/', require('./routes/snippetRoutes'));
app.use('/', require('./routes/profileRoutes'));
app.use('/auth', require('./routes/authRoutes'));

// 404
app.use((req, res) => {
  res.status(404).render('pages/404', { title: '404 - Not Found' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});


app.use((err, req, res, next) => {
  console.error(err);

  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).render('pages/error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`3cols running → http://localhost:${PORT}`);
});
