const cron = require('node-cron');
const ItemController = require('../controllers/itemController');
const { getEventosCulturales } = require('../processors/agendaZaragoza');
const { getPlaces } = require('../processors/lugares');


// Tarea diaria a las 00:00 (medianoche)
cron.schedule('0 0 * * *', async () => {
  console.log('¡La tarea diaria se ha ejecutado!');
  try {
    const eventos = await getEventosCulturales();
    await ItemController.guardarEventos(eventos);
    console.log(`Total eventos obtenidos: ${eventos.length}`);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
  }
});

// Tarea anual el 1 de enero a las 00:00 (medianoche)
cron.schedule('0 0 1 1 *', async () => {
  console.log('¡La tarea anual se ha ejecutado!');
  try {
    const places = await getPlaces();
    await ItemController.guardarLugares(places);
    console.log(`Total lugares obtenidos: ${places.length}`);
  } catch (error) {
    console.error('Error al obtener lugares:', error);
  }
});
