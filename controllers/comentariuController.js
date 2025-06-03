const Comentariu = require('../models/comentariu');
const Postare = require('../models/postare');
const Utilizator = require('../models/utilizator');

// Adăugare comentariu nou
exports.adaugareComentariu = async (req, res) => {
  try {
    const postareId = req.params.postareId;
    const { text } = req.body;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    const utilizatorId = req.session.utilizator._id;
    
    // Verificare existență postare
    const postare = await Postare.findById(postareId);
    
    if (!postare) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Postarea nu a fost găsită'
      });
    }
    
    // Creare comentariu nou
    const comentariuNou = new Comentariu({
      postareId,
      autorId: utilizatorId,
      text
    });
    
    await comentariuNou.save();
    
    // Adăugare referință la comentariu în postare
    postare.comentarii.push(comentariuNou._id);
    await postare.save();
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      // Populare informații autor pentru a le trimite înapoi
      const comentariuPopulat = await Comentariu.findById(comentariuNou._id)
        .populate('autorId', 'username pozaProfil');
      
      return res.json({
        succes: true,
        comentariu: comentariuPopulat
      });
    }
    
    // Redirecționare către postare pentru cereri non-AJAX
    res.redirect(`/postari/${postareId}`);
  } catch (err) {
    console.error('Eroare adăugare comentariu:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la adăugarea comentariului'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la adăugarea comentariului'
    });
  }
};

// Editare comentariu
exports.editareComentariu = async (req, res) => {
  try {
    const comentariuId = req.params.id;
    const { text } = req.body;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    const utilizatorId = req.session.utilizator._id;
    
    // Obținere comentariu
    const comentariu = await Comentariu.findById(comentariuId);
    
    if (!comentariu) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Comentariul nu a fost găsit'
      });
    }
    
    // Verificare dacă utilizatorul este autorul comentariului sau admin
    if (comentariu.autorId.toString() !== utilizatorId && 
        req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu ai permisiunea să editezi acest comentariu'
      });
    }
    
    // Actualizare text comentariu
    comentariu.text = text;
    await comentariu.save();
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.json({
        succes: true,
        comentariu
      });
    }
    
    // Redirecționare către postarea asociată pentru cereri non-AJAX
    res.redirect(`/postari/${comentariu.postareId}`);
  } catch (err) {
    console.error('Eroare editare comentariu:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la editarea comentariului'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la editarea comentariului'
    });
  }
};

// Ștergere comentariu
exports.stergereComentariu = async (req, res) => {
  try {
    const comentariuId = req.params.id;
    
    // Verificare dacă utilizatorul este autentificat
    if (!req.session.utilizator) {
      return res.redirect('/utilizatori/login');
    }
    
    const utilizatorId = req.session.utilizator._id;
    
    // Obținere comentariu
    const comentariu = await Comentariu.findById(comentariuId);
    
    if (!comentariu) {
      return res.status(404).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Comentariul nu a fost găsit'
      });
    }
    
    // Verificare dacă utilizatorul este autorul comentariului sau admin
    if (comentariu.autorId.toString() !== utilizatorId && 
        req.session.utilizator.rol !== 'admin') {
      return res.status(403).render('error', {
        titlu: 'Eroare - CivicAlert',
        mesaj: 'Nu ai permisiunea să ștergi acest comentariu'
      });
    }
    
    // Obținere postare pentru a elimina referința către comentariu
    const postare = await Postare.findById(comentariu.postareId);
    
    if (postare) {
      postare.comentarii = postare.comentarii.filter(
        id => id.toString() !== comentariuId
      );
      await postare.save();
    }
    
    // Ștergere comentariu
    await Comentariu.findByIdAndDelete(comentariuId);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.json({
        succes: true,
        mesaj: 'Comentariu șters cu succes'
      });
    }
    
    // Redirecționare către postarea asociată pentru cereri non-AJAX
    res.redirect(`/postari/${comentariu.postareId}`);
  } catch (err) {
    console.error('Eroare ștergere comentariu:', err);
    
    // Răspuns JSON pentru cereri AJAX
    if (req.xhr) {
      return res.status(500).json({
        succes: false,
        mesaj: 'Eroare la ștergerea comentariului'
      });
    }
    
    // Redirecționare către pagina de eroare pentru cereri non-AJAX
    res.status(500).render('error', {
      titlu: 'Eroare - CivicAlert',
      mesaj: 'Eroare la ștergerea comentariului'
    });
  }
};