const mongoose = require('mongoose');

const comentariuSchema = new mongoose.Schema({
  postareId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Postare',
    required: true
  },
  autorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilizator',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  dataComentariu: {
    type: Date,
    default: Date.now
  }
});

const Comentariu = mongoose.model('Comentariu', comentariuSchema);

module.exports = Comentariu;