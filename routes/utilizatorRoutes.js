const express = require('express');
const router = express.Router();
const utilizatorController = require('../controllers/utilizatorController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Afișare formular de înregistrare
router.get('/register', utilizatorController.afisareFormularInregistrare);

// Înregistrare utilizator nou
router.post('/register', utilizatorController.inregistrareUtilizator);

// Afișare formular de login
router.get('/login', utilizatorController.afisareFormularLogin);

// Autentificare utilizator
router.post('/login', utilizatorController.autentificareUtilizator);

// Deconectare utilizator
router.get('/logout', utilizatorController.deconectareUtilizator);

// Afișare profil utilizator
router.get('/profil/:id', utilizatorController.afisareProfil);

// Afișare formular editare profil (necesită autentificare)
router.get('/editare-profil', 
  auth.esteAutentificat,
  auth.verificaContActiv,
  utilizatorController.afisareFormularEditareProfil
);

// Actualizare profil utilizator (necesită autentificare)
router.post('/editare-profil', 
  auth.esteAutentificat,
  auth.verificaContActiv,
  upload.incarcaPozaProfil,
  utilizatorController.actualizareProfil
);

// Schimbare parolă utilizator (necesită autentificare)
router.post('/schimbare-parola', 
  auth.esteAutentificat,
  auth.verificaContActiv,
  utilizatorController.schimbareParola
);

module.exports = router;