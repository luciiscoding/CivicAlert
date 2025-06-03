const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

// Încărcarea variabilelor de mediu
dotenv.config();

// Inițializarea aplicației Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectat la MongoDB'))
  .catch(err => console.error('Eroare conectare MongoDB:', err));

// Configurare middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Configurare sesiuni
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sesiuni'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 zi
  }
}));

// Setare motor de vizualizare EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pentru variabile globale
app.use((req, res, next) => {
  res.locals.utilizatorCurent = req.session.utilizator || null;
  next();
});

// Importarea rutelor
const utilizatorRoutes = require('./routes/utilizatorRoutes');
const postareRoutes = require('./routes/postareRoutes');
const comentariuRoutes = require('./routes/comentariuRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Utilizarea rutelor
app.use('/utilizatori', utilizatorRoutes);
app.use('/postari', postareRoutes);
app.use('/comentarii', comentariuRoutes);
app.use('/admin', adminRoutes);

// Ruta principală
app.get('/', (req, res) => {
  res.render('index', { titlu: 'CivicAlert - Raportează probleme din comunitatea ta' });
});
// Rută temporară pentru debugging sesiune
app.get('/check-session', (req, res) => {
  res.json({
    session: req.session,
    utilizator: req.session.utilizator || null
  });
});

// Pornirea serverului
app.listen(PORT, () => {
  console.log(`Serverul rulează pe portul ${PORT}`);
});