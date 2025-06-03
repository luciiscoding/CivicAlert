const Postare = require('../models/postare');
const Comentariu = require('../models/comentariu');
const Utilizator = require('../models/utilizator');
const fs = require('fs');
const path = require('path');

// Afișare feed postări pe județ
exports.afisareFeedJudet = async (req, res) => {
  try {
    const judet = req.params.judet;
    
    // Obținere postări pentru județul specificat, sortate după data postării (cele mai recente primele)
    const postari = await Postare.find({ 'localizare.judet': judet, status: { $ne: 'rezolvat' } })
      .populate('autorId', 'username pozaProfil')
      .sort({ dataPostare: -1 });
    
    // Verificare dacă există postări "rezolvat" din ultimele 24 de ore pentru a le afișa și pe acestea
    const dataLimita = new Date();
    dataLimita.setDate(dataLimita.getDate() - 1); // 24 de ore în urmă
    
    const postariRezolvate = await Postare.find({
      'localizare.judet': judet,
      status: 'rezolvat',
      dataPostare: { $gte: dataLimita }
    })
    .populate('autorId', 'username pozaProfil')
    .sort({ dataPostare: -1 });
    
    // Combinarea postărilor
    const toatePostarile = [...postari, ...postariRezolvate];
    
    res.render('feed', {
      titlu: `Probleme în județul ${judet} - CivicAlert`,
      judet,
      postari: toatePostarile,
      utilizatorCurent: req.session.utilizator || null
    });
  } catch (err) {
    console.error('Eroare afișare feed:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea feed-ului'
    });
  }
};

// Afișare postare individuală
exports.afisarePostare = async (req, res) => {
  try {
    const postareId = req.params.id;
    
    // Obținere postare cu informații despre autor și comentarii
    const postare = await Postare.findById(postareId)
      .populate('autorId', 'username pozaProfil')
      .populate({
        path: 'comentarii',
        populate: {
          path: 'autorId',
          select: 'username pozaProfil'
        }
      });
    
    if (!postare) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Postarea nu a fost găsită'
      });
    }
    
    res.render('postare', {
      titlu: `${postare.titlu} - CivicAlert`,
      postare,
      utilizatorCurent: req.session.utilizator || null
    });
  } catch (err) {
    console.error('Eroare afișare postare:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea postării'
    });
  }
};

// Afișare formular creare postare
exports.afisareFormularCrearePostare = (req, res) => {
  const judet = req.params.judet;
  
  res.render('creare-postare', {
    titlu: `Raportează o problemă în județul ${judet} - CivicAlert`,
    judet
  });
};

// Creare postare nouă
exports.crearePostare = async (req, res) => {
  try {
    const { titlu, descriere, lat, lng, judet } = req.body;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    // Creare postare nouă
    const postareNoua = new Postare({
      titlu,
      descriere,
      localizare: {
        lat,
        lng,
        judet
      },
      autorId: req.session.utilizator._id
    });
    
    // Adăugare imagini (dacă există)
    if (req.files && req.files.length > 0) {
      postareNoua.imagini = req.files.map(file => file.filename);
    }
    
    await postareNoua.save();
    
    res.redirect(`/postari/feed/${judet}`);
  } catch (err) {
    console.error('Eroare creare postare:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la crearea postării'
    });
  }
};

// Afișare formular editare postare
exports.afisareFormularEditarePostare = async (req, res) => {
  try {
    const postareId = req.params.id;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    // Obținere postare
    const postare = await Postare.findById(postareId);
    
    if (!postare) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Postarea nu a fost găsită'
      });
    }
    
    // Verificare dacă utilizatorul este autorul postării sau admin
    if (postare.autorId.toString() !== req.session.utilizator._id && 
        req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu ai permisiunea să editezi această postare'
      });
    }
    
    res.render('editare-postare', {
      titlu: `Editare postare - CivicAlert`,
      postare
    });
  } catch (err) {
    console.error('Eroare afișare formular editare postare:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea formularului de editare'
    });
  }
};

// Actualizare postare
exports.actualizarePostare = async (req, res) => {
  try {
    const postareId = req.params.id;
    const { titlu, descriere } = req.body;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    // Obținere postare
    const postare = await Postare.findById(postareId);
    
    if (!postare) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Postarea nu a fost găsită'
      });
    }
    
    // Verificare dacă utilizatorul este autorul postării sau admin
    if (postare.autorId.toString() !== req.session.utilizator._id && 
        req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu ai permisiunea să editezi această postare'
      });
    }
    
    // Actualizare date postare
    postare.titlu = titlu;
    postare.descriere = descriere;
    
    // Adăugare imagini noi (dacă există)
    if (req.files && req.files.length > 0) {
      // Ștergere imagini vechi
      if (postare.imagini && postare.imagini.length > 0) {
        postare.imagini.forEach(imagine => {
          const caleFisier = path.join(__dirname, '../public/uploads/posts', imagine);
          
          if (fs.existsSync(caleFisier)) {
            fs.unlinkSync(caleFisier);
          }
        });
      }
      
      postare.imagini = req.files.map(file => file.filename);
    }
    
    await postare.save();
    
    res.redirect(`/postari/${postareId}`);
  } catch (err) {
    console.error('Eroare actualizare postare:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la actualizarea postării'
    });
  }
};

// Ștergere postare
exports.stergerePostare = async (req, res) => {
  try {
    const postareId = req.params.id;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    // Obținere postare
    const postare = await Postare.findById(postareId);
    
    if (!postare) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Postarea nu a fost găsită'
      });
    }
    
    // Verificare dacă utilizatorul este autorul postării sau admin
    if (postare.autorId.toString() !== req.session.utilizator._id && 
        req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu ai permisiunea să ștergi această postare'
      });
    }
    
    // Ștergere imagini asociate
    if (postare.imagini && postare.imagini.length > 0) {
      postare.imagini.forEach(imagine => {
        const caleFisier = path.join(__dirname, '../public/uploads/posts', imagine);
        
        if (fs.existsSync(caleFisier)) {
          fs.unlinkSync(caleFisier);
        }
      });
    }
    
    // Ștergere comentarii asociate
    await Comentariu.deleteMany({ postareId });
    
    // Ștergere postare
    await Postare.findByIdAndDelete(postareId);
    
    // Redirecționare către feed-ul județului
    res.redirect(`/postari/feed/${postare.localizare.judet}`);
  } catch (err) {
    console.error('Eroare ștergere postare:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la ștergerea postării'
    });
  }
};

// Actualizare status postare (doar pentru admin)
exports.actualizareStatusPostare = async (req, res) => {
  try {
    const postareId = req.params.id;
    const { status } = req.body;
    
    // Verificare dacă utilizatorul este admin
    if (!req.session.utilizator || req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu ai permisiunea să actualizezi statusul postării'
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
    
    res.redirect(`/postari/${postareId}`);
  } catch (err) {
    console.error('Eroare actualizare status postare:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la actualizarea statusului postării'
    });
  }
};

// Votare postare
exports.votarePostare = async (req, res) => {
  try {
    const postareId = req.params.id;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    const utilizatorId = req.session.utilizator._id;
    
    // Obținere postare
    const postare = await Postare.findById(postareId);
    
    if (!postare) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Postarea nu a fost găsită'
      });
    }
    
    // Verificare dacă utilizatorul a votat deja
    const aVotatDeja = postare.voturi.includes(utilizatorId);
    
    if (aVotatDeja) {
      // Retragere vot
      postare.voturi = postare.voturi.filter(id => id.toString() !== utilizatorId);
    } else {
      // Adăugare vot
      postare.voturi.push(utilizatorId);
    }
    
    await postare.save();
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.json({
        succes: true,
        numarVoturi: postare.voturi.length,
        aVotat: !aVotatDeja
      });
    }
    
    // Redirecționare către postare pentru cereri non-AJAX
    res.redirect(`/postari/${postareId}`);
  } catch (err) {
    console.error('Eroare votare postare:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la procesarea votului'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la procesarea votului'
    });
  }
};

// Obținere postări utilizator
exports.obtinerePostariUtilizator = async (req, res) => {
  try {
    const utilizatorId = req.params.id;
    
    // Obținere utilizator
    const utilizator = await Utilizator.findById(utilizatorId);
    
    if (!utilizator) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Utilizatorul nu a fost găsit'
      });
    }
    
    // Obținere postări ale utilizatorului
    const postari = await Postare.find({ autorId: utilizatorId })
      .sort({ dataPostare: -1 });
    
    res.render('postari-utilizator', {
      titlu: `Contribuția lui ${utilizator.username} - CivicAlert`,
      utilizator,
      postari
    });
  } catch (err) {
    console.error('Eroare obținere postări utilizator:', err);
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea postărilor utilizatorului'
    });
  }
};