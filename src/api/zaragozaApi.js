const axios = require('axios');
const logger = require('../logger/logger.js'); 

async function fetchFromAPI(url, params = {}) {
  try {
    const response = await axios.get(url, { params });
    logger.info(`Llamada exitosa a API: ${url}`, { params });
    return response.data;
  } catch (error) {
    logger.error(`Error al llamar a ${url}`, {
      message: error.message,
      code: error.code,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
      params
    });
    return null;
  }
}


module.exports = { fetchFromAPI };
