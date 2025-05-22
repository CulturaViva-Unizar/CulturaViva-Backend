const { fetchFromAPI } = require('../api/zaragozaApi'); 
const { Place } = require('../models/eventModel');
const { cleanHtmltags } = require('../utils/utils');
const logger = require('../logger/logger.js');

// Swagger: https://www.zaragoza.es/docs-api_sede/#/Agenda%20Zaragoza/get_servicio_actividades_evento_list
// la url al .env mejor
const AGENDA_URL = process.env.AGENDA_URL


async function getCoordinates(evento) {
  if (!evento.location) return null;

  try {
    const place = await Place.findOne({ title: evento.location });

    // si existe el lugar en la base de datos && tiene coordenadas, lsas devolvemos
    if (place && place.coordinates) {
      return {
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude,
      };
    }

    return null;
  } catch (error) {
    logger.error(`Error buscando coordenadas para ${evento.location}:`, error.message, {
      message: error.message,
      stack: error.stack,
      evento,
    });
    return null;
  }
}

//
/**
 * Obtiene eventos culturales iterando sobre el parámetro `start` hasta que no haya más datos en `features`.
 * @returns {Promise<Array>} Array de objetos JSON con los datos de los eventos.
 */
async function getEventosCulturales() {
  const eventos = [];
  let start = 0;
  const rows = 1000;

  while (true) {
    const params = {
      fl: 'id,title,type,instagram,twitter,description,image,price,geometry,startDate,endDate,permanent,location',
      rf: 'html',
      srsname: 'wgs84',
      start,
      rows,
      distance: 500,
    };

    try {
      const response = await fetchFromAPI(AGENDA_URL, params);
      //console.log(`Response from API: ${JSON.stringify(response)}`);

      if (!response || !response.result || response.result.length === 0) {
        break;
      }

      const processedEvents = await Promise.all(
        response.result.map(async (evento) => {
          return {
            ...evento,
            price: Array.isArray(evento.price)
              ? evento.price.map((p) => ({
                grupo: p.fareGroup || "",
                precio: p.hasCurrencyValue || "",
              }))
              : [],
            coordinates: evento.geometry
              ? {
                latitude: evento.geometry.coordinates[1],
                longitude: evento.geometry.coordinates[0],
              }
              : await getCoordinates(evento),
            startDate: evento.startDate ? new Date(evento.startDate) : null,
            endDate: evento.endDate ? new Date(evento.endDate) : null,
            place: evento.location ? evento.location : "",
            description: evento.description ? cleanHtmltags(evento.description) : "",
            category: evento.type ? evento.type : "",
          };
        })
      );

      eventos.push(...processedEvents);

      start += rows;
    } catch (error) {
      logger.error(`Error fetching data from start=${start}:`, error.message, {
        message: error.message,
        stack: error.stack,
        start,
        rows,
      });
      break;
    }
  }

  return eventos;
}

module.exports = { getEventosCulturales };
