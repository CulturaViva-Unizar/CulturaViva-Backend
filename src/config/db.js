const mongoose = require('mongoose');
const env = require('./env.js')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.DB_CONNECTION);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB desconectado');
  } catch (error) {
    console.error(`Error al desconectar de MongoDB: ${error.message}`);
  }
};


module.exports = { connectDB, disconnectDB };
