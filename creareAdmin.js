const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Conectare la MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectat la MongoDB'))
  .catch(err => {
    console.error('Eroare conectare MongoDB:', err);
    process.exit(1);
  });

// Model utilizator simplificat
const utilizatorSchema = new mongoose.Schema({
  username: String,
  email: String,
  parola: String,
  rol: String,
  status: String,
  dataCreare: Date
});

// Metoda pentru hasharea parolei
utilizatorSchema.pre('save', async function(next) {
  if (!this.isModified('parola')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.parola = await bcrypt.hash(this.parola, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Utilizator = mongoose.model('Utilizator', utilizatorSchema);

// Creare cont admin
const createAdmin = async () => {
  try {
    // Verifică dacă există deja un admin
    const adminExistent = await Utilizator.findOne({ email: 'admin@admin.com' });
    
    if (adminExistent) {
      console.log('Admin există deja!');
      
      // Actualizare rol la admin dacă nu este deja
      if (adminExistent.rol !== 'admin') {
        await Utilizator.updateOne(
          { email: 'admin@admin.com' },
          { $set: { rol: 'admin' } }
        );
        console.log('Rolul utilizatorului a fost actualizat la admin');
      }
    } else {
      // Creare admin nou
      const admin = new Utilizator({
        username: 'admin',
        email: 'admin@admin.com',
        parola: 'admin123',
        rol: 'admin',
        status: 'activ',
        dataCreare: new Date()
      });
      
      await admin.save();
      console.log('Cont admin creat cu succes!');
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Eroare:', err);
  }
};

createAdmin();