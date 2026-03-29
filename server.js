require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

const app = express();

// ✅ IMPORTANT: connect DB (serverless safe)
connectDB();

// View engine (IMPORTANT for Vercel)
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Security headers
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

// Rate limit
app.use('/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ IMPORTANT for Vercel static files
app.use(express.static(path.join(process.cwd(), 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Flash
app.use(flash());

// Globals
app.use((req, res, next) => {
  res.locals.user = null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.showFooter = false;
  next();
});

// Auth middleware
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

// API fallback
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Error handler
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

// ✅ IMPORTANT: export instead of listen
module.exports = app;