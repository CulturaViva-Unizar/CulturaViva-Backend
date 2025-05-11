const { fetchJsonFromUrl } = require('../api/zaragozaJson'); 
const { cleanHtmltags } = require('../utils/utils');

const PLACE_URLS = {
  'Sala de Música': process.env.SALAS_MUSICA_URL,
  'Centro de Tiempo libre': process.env.CENTROS_TIEMPO_LIBRE_URL,
  'Zona Joven': process.env.ZONAS_JOVEN_URL,
  'Museo': process.env.MUSEOS_URL,
  'Sala de exposiciones': process.env.SALAS_EXPOSICIONES_URL,
  'Galería de arte': process.env.GALERIAS_ARTE_URL,
  'Teatro': process.env.TEATROS_URL,
  'Biblioteca': process.env.BIBLIOTECAS_URL,
};

//
/**
 * Obtiene eventos culturales iterando sobre el parámetro `start` hasta que no haya más datos en `features`.
 * @returns {Promise<Array>} Array de objetos JSON con los datos de los eventos.
 */
async function processPlace(type, url) {
  const response = await fetchJsonFromUrl(url);

  const lugares = response.map(lugar => ({
    id : lugar.id,
    title: lugar.title,
    type: type,
    description: lugar.description ? cleanHtmltags(lugar.description) : "",
    coordinates: {
      latitude: lugar.latitud,
      longitude: lugar.longitud,
    } || "",
    direction: lugar.streetAddress || "",
    openingHours: lugar.openingHours ? cleanHtmltags(lugar.openingHours) : "",
    phone: lugar.telephone || "",
    email: lugar.email || "",
  }));

  return lugares;
}

async function getPlaces(){
  const promises = Object.entries(PLACE_URLS).map(([type, url]) => {
    return processPlace(type, url);
  });

  const results = await Promise.all(promises);
  return results.flat();
}

module.exports = { getPlaces };

