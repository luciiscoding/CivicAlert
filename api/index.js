const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const app = express();

// Configurare pentru producție
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Setare view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware pentru static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || process.env.DATABASE_URL
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 ore
  }
}));

app.use(flash());

// Middleware global pentru variabile locale
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.utilizatorCurent = req.session.user || null;
  next();
});

// Import routes
const indexRoutes = require('./routes/index');
const postariRoutes = require('./routes/postari');
const utilizatoriRoutes = require('./routes/utilizatori');
const adminRoutes = require('./routes/admin');

// Routes
app.use('/', indexRoutes);
app.use('/postari', postariRoutes);
app.use('/utilizatori', utilizatoriRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    message: 'A apărut o eroare internă',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Pagina nu a fost găsită',
    error: { status: 404 }
  });
});

// Pentru Vercel
module.exports = app;

// Pentru dezvoltare locală
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
  });
}