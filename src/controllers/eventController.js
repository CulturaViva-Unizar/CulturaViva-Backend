const eventController = require('../controllers/eventController');
const express = require('express');

class EventController {

    /**
     * Obtiene todos los eventos
     */
    async getEvents(req, res) {
        try {
            const events = await eventController.getAllEvents();
            return res.status(200).json(events);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching events', error });
        }
    }

    /**
     * Obtiene un evento por su ID
     */
    async getEventById(req, res) {
        try {
            const eventId = req.params.eventId;
            const event = await eventController.getEventById(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            return res.status(200).json(event);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching event', error });
        }
    }
}

module.exports = new EventController(); 