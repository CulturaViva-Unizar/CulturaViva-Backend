const axios = require('axios');

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

    return results;
  } catch (error) {
    console.error(`Error al realizar la petición a ${url}:`, error.message);
    throw new Error('No se pudo obtener la respuesta JSON');
  }
}

module.exports = { fetchJsonFromUrl };