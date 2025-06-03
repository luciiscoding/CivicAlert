const express = require('express');
const router = express.Router();
const postareController = require('../controllers/postareController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Afișare feed postări pentru un județ
router.get('/feed/:judet', postareController.afisareFeedJudet);

// Afișare formular creare postare (necesită autentificare)
router.get('/creare/:judet',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.verificaRestrictii,
  postareController.afisareFormularCrearePostare
);

// Creare postare nouă (necesită autentificare)
router.post('/creare',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.verificaRestrictii,
  upload.incarcaImaginiPostare,
  postareController.crearePostare
);

// Afișare postare individuală
router.get('/:id', postareController.afisarePostare);

// Afișare formular editare postare (necesită autentificare + autor sau admin)
router.get('/editare/:id',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.verificaRestrictii,
  postareController.afisareFormularEditarePostare
);

// Actualizare postare (necesită autentificare + autor sau admin)
router.put('/:id',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.verificaRestrictii,
  upload.incarcaImaginiPostare,
  postareController.actualizarePostare
);

// Ștergere postare (necesită autentificare + autor sau admin)
router.delete('/:id',
  auth.esteAutentificat,
  auth.verificaContActiv,
  postareController.stergerePostare
);

// Actualizare status postare (doar admin)
router.patch('/:id/status',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.esteAdmin,
  postareController.actualizareStatusPostare
);

// Votare postare (necesită autentificare)
router.post('/:id/vot',
  auth.esteAutentificat,
  auth.verificaContActiv,
  auth.verificaRestrictii,
  postareController.votarePostare
);

// Obținere postări ale unui utilizator
router.get('/utilizator/:id', postareController.obtinerePostariUtilizator);

module.exports = router;