const mongoose = require('mongoose');
const env = require('./env.js')
const logger = require('../logger/logger.js');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.DB_CONNECTION);
    logger.info(`MongoDB conectado: ${conn.connection.host}`, {
      host: conn.connection.host,
      port: conn.connection.port,
      dbName: conn.connection.name,
    });
  } catch (error) {
    logger.error(`Error al conectar a MongoDB: ${error.message}`, {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB desconectado', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      dbName: mongoose.connection.name,
    });
  } catch (error) {
    logger.error(`Error al desconectar de MongoDB: ${error.message}`, {
      message: error.message,
      stack: error.stack,
    });
  }
};


module.exports = { connectDB, disconnectDB };
