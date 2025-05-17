const axios = require('axios');
const logger = require('../logger/logger.js');

/**
 * Realiza una petición a una URL y devuelve la respuesta JSON tal cual.
 * @param {string} url - La URL a la que se realizará la petición.
 * @returns {Promise<Object>} La respuesta JSON de la URL.
 */
async function fetchJsonFromUrl(url) {
  try {
    const response = await axios.post(url, 
      { from: 0, size: 10000 }, // body
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const hits = response.data.hits?.hits || [];

    const results = hits.map(hit => hit._source || hit);

    logger.info(`Petición POST exitosa a ${url}`, {
      totalHits: hits.length,
    });

    return results;
  } catch (error) {
    logger.error(`Error al realizar la petición a ${url}`, {
      message: error.message,
      code: error.code,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });
    throw new Error('No se pudo obtener la respuesta JSON');
  }
}

module.exports = { fetchJsonFromUrl };