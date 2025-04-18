const eventController = require('./itemController');
const { Item, Event, Place } = require('../models/eventModel');
const { toObjectId, generateOID } = require('../utils/utils');


class ItemController {

    /**
     * Obtiene todos los ítems (eventos o lugares)
     */
    async getItems(req, res) {
        const type = req.query.type || 'Event';
        try {
            let items;
            if (type === 'Event') {
                items = await Event.find();
            } else if (type === 'Place') {
                items = await Place.find();
            } else {
                return res.status(400).json({ message: 'Tipo inválido. Usa "event" o "place".' });
            }
    
            return res.status(200).json({ success: true, data: items });
        } catch (error) {
            console.error('Error al obtener ítems:', error);
            return res.status(500).json({ success: false, message: 'Error al obtener ítems', error });
        }
    }

    /**
     * Obtiene un ítem (evento o lugar) por su ID
     */
    async getItemById(req, res) {
        const type = req.query.type || 'Event';
        try {
            const eventId = toObjectId(req.params.id);
            console.log('ID del evento:', eventId);
            const event = await Item.findOne({ _id: eventId, itemType: type });
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            return res.status(200).json(event);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching event', error });
        }
    }

    async guardarEventos(eventos) {
      // La api falla (es posible: la llevan -vagos- funcionarios) y no devuelve nada
      if (datosProcesados.lenth <= 0) return; 
      for(const evento of eventos){
        evento._id = generateOID(evento.id);
        await evento.updateOne(
            { _id: evento._id },
            { $set: evento },
            { upsert: true }
        )
      }
    }

}

module.exports = new ItemController(); 