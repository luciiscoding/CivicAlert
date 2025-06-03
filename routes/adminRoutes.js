const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Verificare middleware pentru toate rutele de admin
router.use(auth.esteAutentificat);
router.use(auth.verificaContActiv);
router.use(auth.esteAdmin);

// Afișare panou admin
router.get('/', adminController.afisarePanouAdmin);

// Gestionare probleme
router.get('/gestionare-probleme', adminController.afisareGestionareProbleme);

// Actualizare status postare
router.post('/postari/:id/status', adminController.actualizareStatusPostare);

// Gestionare utilizatori
router.get('/gestionare-utilizatori', adminController.afisareGestionareUtilizatori);

// Actualizare status utilizator
router.post('/utilizatori/:id/status', adminController.actualizareStatusUtilizator);

// Adăugare restricție pentru utilizator
router.post('/restrictii', adminController.adaugareRestrictie);

// Ștergere restricție
router.delete('/restrictii/:id', adminController.stergereRestrictie);

module.exports = router;