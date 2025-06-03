const mongoose = require('mongoose');

const postareSchema = new mongoose.Schema({
  titlu: {
    type: String,
    required: true,
    trim: true
  },
  descriere: {
    type: String,
    required: true,
    trim: true
  },
  imagini: {
    type: [String],
    default: []
  },
  localizare: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    judet: {
      type: String,
      required: true,
      trim: true
    }
  },
  autorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  dataPostare: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['inAsteptare', 'inLucru', 'rezolvat'],
    default: 'inAsteptare'
  },
  voturi: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator'
  }],
  comentarii: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comentariu'
  }]
});

// Metoda virtuală pentru numărul de voturi
postareSchema.virtual('numarVoturi').get(function() {
  return this.voturi.length;
});

// Metoda virtuală pentru numărul de comentarii
postareSchema.virtual('numarComentarii').get(function() {
  return this.comentarii.length;
});

// Asigură că virtualele sunt incluse când documentul este convertit în JSON
postareSchema.set('toJSON', { virtuals: true });
postareSchema.set('toObject', { virtuals: true });

const Postare = mongoose.model('Postare', postareSchema);

module.exports = Postare;