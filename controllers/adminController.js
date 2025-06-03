const Utilizator = require('../models/utilizator');
const Postare = require('../models/postare');
const Restrictie = require('../models/restrictie');

// Afișare panou admi
exports.afisarePanouAdmin = async (req, res) => {
  try {
    // Obținere date sumar
    const numarUtilizatori = await Utilizator.countDocuments();
    const numarPostari = await Postare.countDocuments();
    const numarPostariInAsteptare = await Postare.countDocuments({ status: 'inAsteptare' });
    const numarPostariInLucru = await Postare.countDocuments({ status: 'inLucru' }); // Asigură-te că această linie există
    const numarPostariRezolvate = await Postare.countDocuments({ status: 'rezolvat' });
    
    res.render('admin/panou', {
      titlu: 'Panou Administrare - CivicAlert',
      numarUtilizatori,
      numarPostari,
      numarPostariInAsteptare,
      numarPostariInLucru, // Asigură-te că variabila este trimisă către view
      numarPostariRezolvate
    });
  } catch (err) {
    console.error('Eroare afișare panou admin:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea panoului de administrare'
    });
  }
};

// Gestionare probleme
exports.afisareGestionareProbleme = async (req, res) => {
  try {
    // Verificare dacă utilizatorul este admin
    if (!req.session.utilizator || req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Acces interzis - doar pentru administratori'
      });
    }
    
    // Obținere județe distincte
    const judete = await Postare.distinct('localizare.judet');
    
    // Obținere postări pentru județ (dacă este specificat)
    let postari = [];
    const judetSelectat = req.query.judet;
    
    if (judetSelectat) {
      postari = await Postare.find({ 'localizare.judet': judetSelectat })
        .populate('autorId', 'username email')
        .sort({ dataPostare: -1 });
    }
    
    res.render('admin/gestionare-probleme', {
      titlu: 'Gestionare Probleme - CivicAlert',
      judete,
      judetSelectat,
      postari
    });
  } catch (err) {
    console.error('Eroare afișare gestionare probleme:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea paginii de gestionare probleme'
    });
  }
};

// Actualizare status postare (de către admin)
exports.actualizareStatusPostare = async (req, res) => {
  try {
    const postareId = req.params.id;
    const { status } = req.body;
    
    // Verificare dacă utilizatorul este admin
    if (!req.session.utilizator || req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Acces interzis - doar pentru administratori'
      });
    }
    
    // Actualizare status postare
    const postare = await Postare.findByIdAndUpdate(
      postareId,
      { status },
      { new: true }
    );
    
    if (!postare) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Postarea nu a fost găsită'
      });
    }
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.json({
        succes: true,
        postare
      });
    }
    
    // Redirecționare înapoi la pagina de gestionare probleme
    res.redirect(`/admin/gestionare-probleme?judet=${postare.localizare.judet}`);
  } catch (err) {
    console.error('Eroare actualizare status postare:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la actualizarea statusului postării'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la actualizarea statusului postării'
    });
  }
};

// Gestionare utilizatori
exports.afisareGestionareUtilizatori = async (req, res) => {
  try {
    // Verificare dacă utilizatorul este admin
    if (!req.session.utilizator || req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Acces interzis - doar pentru administratori'
      });
    }
    
    // Obținere utilizatori
    const utilizatori = await Utilizator.find({}, '-parola')
      .sort({ dataCreare: -1 });
    
    // Obținere restricții
    const restrictii = await Restrictie.find()
      .populate('userId', 'username email');
    
    res.render('admin/gestionare-utilizatori', {
      titlu: 'Gestionare Utilizatori - CivicAlert',
      utilizatori,
      restrictii
    });
  } catch (err) {
    console.error('Eroare afișare gestionare utilizatori:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea paginii de gestionare utilizatori'
    });
  }
};

// Actualizare status utilizator
exports.actualizareStatusUtilizator = async (req, res) => {
  try {
    const utilizatorId = req.params.id;
    const { status } = req.body;
    
    // Verificare dacă utilizatorul este admin
    if (!req.session.utilizator || req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Acces interzis - doar pentru administratori'
      });
    }
    
    // Verificare dacă utilizatorul nu încearcă să-și schimbe propriul status
    if (utilizatorId === req.session.utilizator._id) {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu îți poți schimba propriul status'
      });
    }
    
    // Actualizare status utilizator
    const utilizator = await Utilizator.findByIdAndUpdate(
      utilizatorId,
      { status },
      { new: true }
    );
    
    if (!utilizator) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Utilizatorul nu a fost găsit'
      });
    }
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.json({
        succes: true,
        utilizator
      });
    }
    
    // Redirecționare înapoi la pagina de gestionare utilizatori
    res.redirect('/admin/gestionare-utilizatori');
  } catch (err) {
    console.error('Eroare actualizare status utilizator:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la actualizarea statusului utilizatorului'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la actualizarea statusului utilizatorului'
    });
  }
};

// Adăugare restricție pentru utilizator
exports.adaugareRestrictie = async (req, res) => {
  try {
    const { userId, tipRestrictie, motivRestrictie, zileRestrictie } = req.body;
    
    // Verificare dacă utilizatorul este admin
    if (!req.session.utilizator || req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Acces interzis - doar pentru administratori'
      });
    }
    
    // Verificare dacă utilizatorul nu încearcă să-și adauge restricție sieși
    if (userId === req.session.utilizator._id) {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu îți poți adăuga restricție ție însuți'
      });
    }
    
    // Calculare dată expirare
    const dataExpirare = new Date();
    dataExpirare.setDate(dataExpirare.getDate() + parseInt(zileRestrictie));
    
    // Creare restricție nouă
    const restrictieNoua = new Restrictie({
      userId,
      tipRestrictie,
      motivRestrictie,
      dataExpirare
    });
    
    await restrictieNoua.save();
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      const restrictiePopulata = await Restrictie.findById(restrictieNoua._id)
        .populate('userId', 'username email');
      
      return res.json({
        succes: true,
        restrictie: restrictiePopulata
      });
    }
    
    // Redirecționare înapoi la pagina de gestionare utilizatori
    res.redirect('/admin/gestionare-utilizatori');
  } catch (err) {
    console.error('Eroare adăugare restricție:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la adăugarea restricției'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la adăugarea restricției'
    });
  }
};

// Ștergere restricție
exports.stergereRestrictie = async (req, res) => {
  try {
    const restrictieId = req.params.id;
    
    // Verificare dacă utilizatorul este admin
    if (!req.session.utilizator || req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Acces interzis - doar pentru administratori'
      });
    }
    
    // Ștergere restricție
    const restrictie = await Restrictie.findByIdAndDelete(restrictieId);
    
    if (!restrictie) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Restricția nu a fost găsită'
      });
    }
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.json({
        succes: true,
        mesaj: 'Restricție ștearsă cu succes'
      });
    }
    
    // Redirecționare înapoi la pagina de gestionare utilizatori
    res.redirect('/admin/gestionare-utilizatori');
  } catch (err) {
    console.error('Eroare ștergere restricție:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la ștergerea restricției'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la ștergerea restricției'
    });
  }
};