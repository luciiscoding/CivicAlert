const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const utilizatorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  parola: {
    type: String,
    required: true
  },
  telefon: {
    type: String,
    trim: true
  },
  pozaProfil: {
    type: String,
    default: 'default-profile.png'
  },
  rol: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['activ', 'inactiv', 'restrictionat'],
    default: 'activ'
  },
  dataCreare: {
    type: Date,
    default: Date.now
  }
});

// Metoda pentru hasharea parolei înainte de salvare
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

// Metoda pentru verificarea parolei
utilizatorSchema.methods.verificaParola = async function(parolaIntrodusa) {
  return await bcrypt.compare(parolaIntrodusa, this.parola);
};

const Utilizator = mongoose.model('Utilizator', utilizatorSchema);

module.exports = Utilizator;