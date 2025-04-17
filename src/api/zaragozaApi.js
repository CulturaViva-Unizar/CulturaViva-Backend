const axios = require('axios');

// función genérica para interrogar a la api de zaragoza
async function fetchFromAPI(url, params = {}) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error(`Error al llamar a ${url}:`, error.message);
    return null;
  }
}

module.exports = { fetchFromAPI };
