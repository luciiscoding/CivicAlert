const Utilizator = require('../models/utilizator');
const Postare = require('../models/postare');
const fs = require('fs');
const path = require('path');

// Afișare formular de înregistrare
exports.afisareFormularInregistrare = (req, res) => {
  res.render('register', { 
    titlu: 'Înregistrare - CivicAlert',
    error: req.query.error || null
  });
};

// Înregistrare utilizator nou
exports.inregistrareUtilizator = async (req, res) => {
  const { username, email, parola, confirmaParola } = req.body;

  // Verificare dacă parolele coincid
  if (parola !== confirmaParola) {
    return res.redirect('/utilizatori/register?error=Parolele nu coincid');
  }

  try {
    // Verificare dacă email-ul sau username-ul există deja
    const utilizatorExistent = await Utilizator.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (utilizatorExistent) {
      return res.redirect('/utilizatori/register?error=Email sau username deja folosit');
    }

    // Creare utilizator nou
    const utilizatorNou = new Utilizator({
      username,
      email,
      parola
    });

    await utilizatorNou.save();

    // Autentificarea utilizatorului după înregistrare
    req.session.utilizator = {
      _id: utilizatorNou._id,
      username: utilizatorNou.username,
      email: utilizatorNou.email,
      rol: utilizatorNou.rol
    };

    res.redirect('/');
  } catch (err) {
    console.error('Eroare înregistrare:', err);
    res.redirect('/utilizatori/register?error=Eroare la înregistrare');
  }
};

// Schimbare parolă utilizator
exports.schimbareParola = async (req, res) => {
  try {
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }

    const { parolaVeche, parolaNoua, confirmaParolaNoua } = req.body;
    
    // Verificare dacă parolele noi coincid
    if (parolaNoua !== confirmaParolaNoua) {
      return res.redirect('/utilizatori/schimbare-parola?error=Parolele noi nu coincid');
    }
    
    // Obținere utilizator curent
    const utilizator = await Utilizator.findById(req.session.utilizator._id);
    
    if (!utilizator) {
      return res.status(404).render('error', { 
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Utilizatorul nu a fost găsit'
      });
    }
    
    // Verificare parolă veche
    const parolaValida = await utilizator.verificaParola(parolaVeche);
    
    if (!parolaValida) {
      return res.redirect('/utilizatori/schimbare-parola?error=Parola veche incorectă');
    }
    
    // Actualizare parolă
    utilizator.parola = parolaNoua;
    await utilizator.save();
    
    res.redirect(`/utilizatori/profil/${utilizator._id}?succes=Parola a fost schimbată cu succes`);
  } catch (err) {
    console.error('Eroare schimbare parolă:', err);
    res.status(500).render('error', { 
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la schimbarea parolei'
    });
  }
};

// Afișare formular de login
exports.afisareFormularLogin = (req, res) => {
  res.render('login', { 
    titlu: 'Autentificare - CivicAlert',
    error: req.query.error || null
  });
};

// Autentificare utilizator
exports.autentificareUtilizator = async (req, res) => {
  const { email, parola } = req.body;

  try {
    // Găsire utilizator după email
    const utilizator = await Utilizator.findOne({ email });

    if (!utilizator) {
      return res.redirect('/utilizatori/login?error=Email sau parolă incorectă');
    }

    // Verificare parolă
    const parolaValida = await utilizator.verificaParola(parola);

    if (!parolaValida) {
      return res.redirect('/utilizatori/login?error=Email sau parolă incorectă');
    }

    // Verificare status cont
    if (utilizator.status !== 'activ') {
      return res.redirect(`/utilizatori/login?error=Contul tău este ${utilizator.status}`);
    }

    // Salvare informații utilizator în sesiune
    req.session.utilizator = {
      _id: utilizator._id,
      username: utilizator.username,
      email: utilizator.email,
      rol: utilizator.rol
    };

    res.redirect('/');
  } catch (err) {
    console.error('Eroare autentificare:', err);
    res.redirect('/utilizatori/login?error=Eroare la autentificare');
  }
};

// Deconectare utilizator
exports.deconectareUtilizator = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Eroare la deconectare:', err);
    res.redirect('/');
  });
};

// Afișare profil utilizator
exports.afisareProfil = async (req, res) => {
  try {
    const utilizator = await Utilizator.findById(req.params.id, '-parola');
    
    if (!utilizator) {
      return res.status(404).render('error', { 
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Utilizatorul nu a fost găsit'
      });
    }

    // Obținere postări ale utilizatorului
    const postari = await Postare.find({ autorId: utilizator._id })
      .sort({ dataPostare: -1 });

    res.render('profil', {
      titlu: `Profil ${utilizator.username} - CivicAlert`,
      utilizator,
      postari
    });
  } catch (err) {
    console.error('Eroare afișare profil:', err);
    res.status(500).render('error', { 
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea profilului'
    });
  }
};

// Afișare formular editare profil
exports.afisareFormularEditareProfil = async (req, res) => {
  try {
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }

    const utilizator = await Utilizator.findById(req.session.utilizator._id);
    
    if (!utilizator) {
      return res.status(404).render('error', { 
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Utilizatorul nu a fost găsit'
      });
    }

    res.render('editare-profil', {
      titlu: 'Editare Profil - CivicAlert',
      utilizator
    });
  } catch (err) {
    console.error('Eroare afișare formular editare profil:', err);
    res.status(500).render('error', { 
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la încărcarea formularului de editare'
    });
  }
};

// Actualizare profil utilizator
exports.actualizareProfil = async (req, res) => {
  try {
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }

    const { username, telefon } = req.body;
    
    // Obținere utilizator curent
    const utilizator = await Utilizator.findById(req.session.utilizator._id);
    
    if (!utilizator) {
      return res.status(404).render('error', { 
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Utilizatorul nu a fost găsit'
      });
    }
    
    // Verificare dacă username-ul există deja la alt utilizator
    if (username !== utilizator.username) {
      const utilizatorExistent = await Utilizator.findOne({ username });
      
      if (utilizatorExistent) {
        return res.redirect('/utilizatori/editare-profil?error=Username deja folosit');
      }
    }
    
    // Actualizare date utilizator
    utilizator.username = username;
    utilizator.telefon = telefon;
    
    // Verificare dacă a fost încărcată o poză de profil
    if (req.file) {
      // Ștergere poza veche dacă există și nu este cea implicită
      if (utilizator.pozaProfil !== 'default-profile.png') {
        const caleFisier = path.join(__dirname, '../public/uploads/profile', utilizator.pozaProfil);
        
        if (fs.existsSync(caleFisier)) {
          fs.unlinkSync(caleFisier);
        }
      }
      
      utilizator.pozaProfil = req.file.filename;
    }
    
    await utilizator.save();
    
    // Actualizare informații utilizator în sesiune
    req.session.utilizator = {
      _id: utilizator._id,
      username: utilizator.username,
      email: utilizator.email,
      rol: utilizator.rol
    };
    
    res.redirect(`/utilizatori/profil/${utilizator._id}`);
  } catch (err) {
    console.error('Eroare actualizare profil:', err);
    res.status(500).render('error', { 
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la actualizarea profilului'
    });
  }
};