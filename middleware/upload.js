const multer = require('multer');
const path = require('path');

// Configurare stocare pentru poze de profil
const stocarePozeProfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/profile');
  },
  filename: (req, file, cb) => {
    const numeFisier = `user-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, numeFisier);
  }
});

// Configurare stocare pentru imagini postări
const stocareImaginiPostari = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/posts');
  },
  filename: (req, file, cb) => {
    const numeFisier = `post-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, numeFisier);
  }
});

// Filtru pentru tipurile de fișiere acceptate
const filtruImagini = (req, file, cb) => {
  const tipuriAcceptate = /jpeg|jpg|png|gif/;
  const extensie = tipuriAcceptate.test(path.extname(file.originalname).toLowerCase());
  const mimeType = tipuriAcceptate.test(file.mimetype);

  if (extensie && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Doar fișierele de imagine sunt acceptate (jpeg, jpg, png, gif)'));
  }
};

// Middleware pentru încărcarea pozelor de profil
exports.incarcaPozaProfil = multer({
  storage: stocarePozeProfil,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: filtruImagini
}).single('pozaProfil');

// Middleware pentru încărcarea imaginilor postărilor
exports.incarcaImaginiPostare = multer({
  storage: stocareImaginiPostari,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: filtruImagini
}).array('imagini', 5); // Maxim 5 imagini