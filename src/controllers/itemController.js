const eventController = require('./itemController');
const { Event, Place } = require('../models/eventModel');


class ItemController {

    /**
     * Obtiene todos los ítems (eventos o lugares)
     */
    async getItems(req, res) {
        const type = req.query.type || 'event';
        try {
            let items;
            if (type === 'event') {
                items = await Event.find();
            } else if (type === 'place') {
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
        const type = req.query.type || 'event';
        try {
            const eventId = req.params.eventId;
            const event = {} // TODO: Fetch event by ID from the database
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            return res.status(200).json(event);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching event', error });
        }
    }
}

module.exports = new ItemController(); 