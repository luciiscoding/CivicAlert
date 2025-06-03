const mongoose = require('mongoose');

const restrictieSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  tipRestrictie: {
    type: String,
    enum: ['vizualizare', 'postare', 'vot', 'comentariu'],
    required: true
  },
  motivRestrictie: {
    type: String,
    trim: true
  },
  dataRestrictie: {
    type: Date,
    default: Date.now
  },
  dataExpirare: {
    type: Date,
    required: true
  }
});

const Restrictie = mongoose.model('Restrictie', restrictieSchema);

module.exports = Restrictie;