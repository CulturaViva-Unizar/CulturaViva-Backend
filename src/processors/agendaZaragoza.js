const { fetchFromAPI } = require('../api/zaragozaApi'); 

// Swagger: https://www.zaragoza.es/docs-api_sede/#/Agenda%20Zaragoza/get_servicio_actividades_evento_list
// la url al .env mejor
const AGENDA_URL = process.env.AGENDA_URL

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
        console.log(`No more features found. Stopping at start=${start}`);
        break;
      }

      const processedEvents = response.result.map(evento => {
        return {
          ...evento,
          price: Array.isArray(evento.price)
            ? evento.price.map(p => ({
                grupo: p.fareGroup || null,
                precio: p.hasCurrencyValue || null,
              }))
            : null, 
          coordinates: evento.geometry ? {
            latitude: evento.geometry.coordinates[1],
            longitude: evento.geometry.coordinates[0],
          } : null,
          startDate: evento.startDate ? new Date(evento.startDate) : null,
          endDate: evento.endDate ? new Date(evento.endDate) : null,
          place: evento.location ? evento.location : null
        };
      });

      eventos.push(...processedEvents);
      console.log(`Fetched ${processedEvents.length} eventos from start=${start}`);

      start += rows;
    } catch (error) {
      console.error(`Error fetching data from start=${start}:`, error.message);
      break;
    }
  }

  console.log(`Total eventos fetched: ${eventos.length}`);
  return eventos;
}

module.exports = { getEventosCulturales };

module.exports = { getEventosCulturales };
