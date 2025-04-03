const express = require('express');
const router = express.Router();

const itemController = require('../controllers/itemController');


/**
 * @swagger
 * tags:
 *  name: Events
 * description: API para la gestión de eventos
 */

/**
 * @swagger
 * /items/events:
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
router.get('/events', 
  (req, res, next) => {
    req.query.type = 'event';
    next();
  }, 
  itemController.getItems);


/**
 * @swagger
 * /items/events/{eventId}:
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
router.get('/events/:eventId', 
  (req, res, next) => {
    req.query.type = 'event';
    next();
  }, 
  itemController.getItemById);

/**
 * @swagger
 * /items/places:
 *   get:
 *     summary: Obtiene todos los lugares
 *     tags:
 *       - Places
 *     responses:
 *       200:
 *         description: Lista de lugares obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/places', 
  (req, res, next) => {
    req.query.type = 'place';
    next();
  }, 
  itemController.getItems);


/**
 * @swagger
 * /items/places/{placeId}:
 *   get:
 *     summary: Obtiene un lugar por su ID
 *     tags:
 *       - Places
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: ID del lugar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lugar obtenido exitosamente
 *       404:
 *         description: Lugar no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/places/:placeId', 
  (req, res, next) => {
    req.query.type = 'place';
    next();
  }, 
  itemController.getItemById);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del evento
 *         title:
 *           type: string
 *           description: Título del evento
 *         category:
 *           type: string
 *           description: Categoría del evento
 *         instagram:
 *           type: string
 *           description: Enlace al perfil de Instagram del evento
 *         twitter:
 *           type: string
 *           description: Enlace al perfil de Twitter del evento
 *         description:
 *           type: string
 *           description: Descripción del evento
 *         image:
 *           type: string
 *           description: URL de la imagen del evento
 *         price:
 *           type: number
 *           description: Precio del evento
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               description: Latitud del evento
 *             longitude:
 *               type: number
 *               description: Longitud del evento
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio del evento
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de finalización del evento
 *         permanent:
 *           type: boolean
 *           description: Indica si el evento es permanente
 *         place:
 *           type: string
 *           description: ID del lugar asociado al evento
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Place:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del lugar
 *         title:
 *           type: string
 *           description: Título del lugar
 *         category:
 *           type: string
 *           description: Categoría del lugar
 *         instagram:
 *           type: string
 *           description: Enlace al perfil de Instagram del lugar
 *         twitter:
 *           type: string
 *           description: Enlace al perfil de Twitter del lugar
 *         description:
 *           type: string
 *           description: Descripción del lugar
 *         image:
 *           type: string
 *           description: URL de la imagen del lugar
 *         price:
 *           type: number
 *           description: Precio asociado al lugar
 *         coordinates:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               description: Latitud del lugar
 *             longitude:
 *               type: number
 *               description: Longitud del lugar
 *         direction:
 *           type: string
 *           description: Dirección del lugar
 *         openingHours:
 *           type: object
 *           properties:
 *             day:
 *               type: string
 *               description: Día de la semana
 *             openingHour:
 *               type: string
 *               description: Hora de apertura
 *             closingHour:
 *               type: string
 *               description: Hora de cierre
 */
