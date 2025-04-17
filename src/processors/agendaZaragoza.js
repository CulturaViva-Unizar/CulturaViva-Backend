const { fetchFromAPI } = require('./apiClient'); // TODO

// Swagger: https://www.zaragoza.es/docs-api_sede/#/Agenda%20Zaragoza/get_servicio_actividades_evento_list
// la url al .env mejor
const AGENDA_URL = process.env.AGENDA_URL


//TODO: unificar
async function getEventosCulturales() {
  return await fetchFromAPI(CULTURA_URL, { rows: 1000 });
}

const Evento = require('../models/evento');

async function guardarEventos(eventos) {
  for (const evento of eventos) {
    await Evento.updateOne(
      { _id: evento._id },
      { $set: evento },
      { upsert: true }
    );
  }
}

module.exports = { guardarEventos };


module.exports = { getEventosCulturales };
