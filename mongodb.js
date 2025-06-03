const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// URI-ul din variabila de mediu
const uri = process.env.MONGODB_URI;

// Configurația clientului MongoDB
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Opțiuni adiționale pentru performanță și stabilitate
  maxPoolSize: 10, // Numărul maxim de conexiuni în pool
  serverSelectionTimeoutMS: 5000, // Timeout pentru selectarea serverului
  socketTimeoutMS: 45000, // Timeout pentru socket
  family: 4 // Folosește IPv4
});

// Variabile globale pentru conexiune
let db = null;
let isConnected = false;

/**
 * Conectează la MongoDB Atlas
 */
async function connectToMongoDB() {
  try {
    if (isConnected && db) {
      console.log('MongoDB: Conexiunea există deja');
      return db;
    }

    console.log('MongoDB: Se conectează la Atlas...');
    
    // Conectează clientul
    await client.connect();
    
    // Testează conexiunea
    await client.db("admin").command({ ping: 1 });
    
    // Setează baza de date (poți schimba numele)
    db = client.db('civicalert');
    isConnected = true;
    
    console.log('MongoDB: Conectat cu succes la Atlas!');
    return db;
    
  } catch (error) {
    console.error('MongoDB: Eroare la conectare:', error.message);
    isConnected = false;
    throw error;
  }
}

/**
 * Deconectează de la MongoDB
 */
async function disconnectFromMongoDB() {
  try {
    if (client && isConnected) {
      await client.close();
      isConnected = false;
      db = null;
      console.log('MongoDB: Deconectat cu succes');
    }
  } catch (error) {
    console.error('MongoDB: Eroare la deconectare:', error.message);
    throw error;
  }
}

/**
 * Obține baza de date (se conectează automat dacă nu e conectat)
 */
async function getDatabase() {
  try {
    if (!isConnected || !db) {
      return await connectToMongoDB();
    }
    return db;
  } catch (error) {
    console.error('MongoDB: Eroare la obținerea bazei de date:', error.message);
    throw error;
  }
}

/**
 * Obține o colecție specifică
 */
async function getCollection(collectionName) {
  try {
    const database = await getDatabase();
    return database.collection(collectionName);
  } catch (error) {
    console.error(`MongoDB: Eroare la obținerea colecției ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Verifică statusul conexiunii
 */
function isMongoConnected() {
  return isConnected;
}

/**
 * Funcții helper pentru operații comune
 */

// Inserează un document
async function insertDocument(collectionName, document) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.insertOne({
      ...document,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`MongoDB: Document inserat în ${collectionName} cu ID: ${result.insertedId}`);
    return result;
  } catch (error) {
    console.error(`MongoDB: Eroare la inserarea în ${collectionName}:`, error.message);
    throw error;
  }
}

// Găsește documente
async function findDocuments(collectionName, query = {}, options = {}) {
  try {
    const collection = await getCollection(collectionName);
    const documents = await collection.find(query, options).toArray();
    return documents;
  } catch (error) {
    console.error(`MongoDB: Eroare la căutarea în ${collectionName}:`, error.message);
    throw error;
  }
}

// Găsește un singur document
async function findOneDocument(collectionName, query = {}) {
  try {
    const collection = await getCollection(collectionName);
    const document = await collection.findOne(query);
    return document;
  } catch (error) {
    console.error(`MongoDB: Eroare la găsirea documentului în ${collectionName}:`, error.message);
    throw error;
  }
}

// Actualizează un document
async function updateDocument(collectionName, filter, update) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.updateOne(
      filter, 
      { 
        $set: { 
          ...update, 
          updatedAt: new Date() 
        } 
      }
    );
    console.log(`MongoDB: ${result.modifiedCount} document(e) actualizat(e) în ${collectionName}`);
    return result;
  } catch (error) {
    console.error(`MongoDB: Eroare la actualizarea în ${collectionName}:`, error.message);
    throw error;
  }
}

// Șterge un document
async function deleteDocument(collectionName, filter) {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteOne(filter);
    console.log(`MongoDB: ${result.deletedCount} document(e) șters(e) din ${collectionName}`);
    return result;
  } catch (error) {
    console.error(`MongoDB: Eroare la ștergerea din ${collectionName}:`, error.message);
    throw error;
  }
}

// Numără documente
async function countDocuments(collectionName, query = {}) {
  try {
    const collection = await getCollection(collectionName);
    const count = await collection.countDocuments(query);
    return count;
  } catch (error) {
    console.error(`MongoDB: Eroare la numărarea în ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Middleware pentru Express.js (opțional)
 */
function mongoMiddleware(req, res, next) {
  req.db = {
    getDatabase,
    getCollection,
    insertDocument,
    findDocuments,
    findOneDocument,
    updateDocument,
    deleteDocument,
    countDocuments
  };
  next();
}

/**
 * Gestionează închiderea aplicației
 */
process.on('SIGINT', async () => {
  console.log('MongoDB: Se închide aplicația...');
  await disconnectFromMongoDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('MongoDB: Se termină aplicația...');
  await disconnectFromMongoDB();
  process.exit(0);
});

// Export toate funcțiile
module.exports = {
  // Funcții de conexiune
  connectToMongoDB,
  disconnectFromMongoDB,
  getDatabase,
  getCollection,
  isMongoConnected,
  
  // Funcții helper
  insertDocument,
  findDocuments,
  findOneDocument,
  updateDocument,
  deleteDocument,
  countDocuments,
  
  // Middleware
  mongoMiddleware,
  
  // Client direct (pentru operații avansate)
  client
};