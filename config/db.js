const mongoose = require('mongoose');

const conectareBazaDate = async () => {
  try {
    const conexiune = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectat: ${conexiune.connection.host}`);
  } catch (err) {
    console.error(`Eroare: ${err.message}`);
    process.exit(1);
  }
};

module.exports = conectareBazaDate;