const express = require('express');
const router = express.Router();
const comentariuController = require('../controllers/comentariuController');
const auth = require('../middleware/auth');

// Adăugare comentariu nou (necesită autentificare)
router.post('/postare/:postareId',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.verificaRestrictii,
  comentariuController.adaugareComentariu
);

// Editare comentariu (necesită autentificare + autor sau admin)
router.put('/:id',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.verificaRestrictii,
  comentariuController.editareComentariu
);

// Ștergere comentariu (necesită autentificare + autor sau admin)
router.delete('/:id',
  auth.esteAutentificat,
  auth.verificaContActiv,
  comentariuController.stergereComentariu
);

module.exports = router;