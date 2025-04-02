const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');


/**
 * @swagger
 * tags:
 *  name: Events
 * description: API para la gestión de eventos
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Obtiene todos los eventos
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: Lista de eventos obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', eventController.getEvents);


/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Obtiene un evento por su ID
 *     tags:
 *       - Events
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: ID del evento
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento obtenido exitosamente
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:eventId', eventController.getEventById);

module.exports = router;