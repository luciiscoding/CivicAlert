const Utilizator = require('../models/utilizator');
const Restrictie = require('../models/restrictie');

// Middleware pentru verificarea dacă utilizatorul este autentificat
exports.esteAutentificat = (req, res, next) => {
  if (req.session.utilizator) {
    return next();
  }
  req.session.mesajEroare = 'Trebuie să fii autentificat pentru a accesa această pagină';
  res.redirect('/utilizatori/login');
};

// Middleware pentru verificarea dacă utilizatorul este admin
exports.esteAdmin = (req, res, next) => {
  if (req.session.utilizator && req.session.utilizator.rol === 'admin') {
    return next();
  }
  req.session.mesajEroare = 'Acces interzis - doar pentru administratori';
  res.redirect('/');
};

// Middleware pentru verificarea restricțiilor utilizatorului
exports.verificaRestrictii = async (req, res, next) => {
  if (!req.session.utilizator) {
    return next();
  }

  try {
    const userId = req.session.utilizator._id;
    const tipActiune = req.path.includes('postari') ? 'postare' : 
                      req.path.includes('comentarii') ? 'comentariu' : 
                      req.path.includes('vot') ? 'vot' : 'vizualizare';
    
    const restrictie = await Restrictie.findOne({
      userId,
      tipRestrictie: tipActiune,
      dataExpirare: { $gt: new Date() }
    });

    if (restrictie) {
      req.session.mesajEroare = `Acțiune restricționată. Restricția expiră la: ${restrictie.dataExpirare.toLocaleDateString()}`;
      return res.redirect('back');
    }

    next();
  } catch (err) {
    console.error('Eroare verificare restricții:', err);
    next();
  }
};

// Middleware pentru verificarea stării contului
exports.verificaContActiv = async (req, res, next) => {
  if (!req.session.utilizator) {
    return next();
  }

  try {
    const utilizator = await Utilizator.findById(req.session.utilizator._id);
    
    if (utilizator.status !== 'activ') {
      req.session.destroy();
      return res.redirect('/utilizatori/login?error=Contul tău este ' + utilizator.status);
    }
    
    next();
  } catch (err) {
    console.error('Eroare verificare status cont:', err);
    next();
  }
};