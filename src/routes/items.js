const express = require('express');
const router = express.Router();
const passport = require('passport');

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
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                success:
 *                  type: boolean
 *                message:
 *                  type: string
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Event'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events', 
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.getItems);


/**
 * @swagger
 * /items/events/{id}:
 *   get:
 *     summary: Obtiene un evento por su ID
 *     tags:
 *       - Events
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del evento
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento obtenido exitosamente
 *         content:
 *          application/json:
 *           schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                message:
 *                  type: string
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:id', 
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.getItemById);


/**
 * @swagger
 * /items/events/{id}/comments:
 *   get:
 *     summary: Obtiene los comentarios de un evento por su ID
 *     tags:
 *       - Events
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del evento
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de comentarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comentarios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:id/comments',
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.getItemComments);

/**
 * @swagger
 * /items/events/{id}/comments:
 *   post:
 *     summary: Crea un comentario para un evento
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del evento
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Contenido del comentario
 *                 example: "Este evento fue increíble"
 *               value:
 *                 type: number
 *                 description: Valoración opcional del evento
 *                 example: 5
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comentario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Datos inválidos
 *       401: 
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:id/comments',
  passport.authenticate('jwt', { session: false }), 
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.createComment);

/**
 * @swagger
 * /items/events/{id}/comments/{commentId}/responses:
 *   get:
 *     summary: Obtiene las respuestas de un comentario de un evento por su ID
 *     tags:
 *       - Events
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del evento
 *         schema:
 *           type: string
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: ID del comentario
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Respuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comentario creado exitosamente"
 *                 data:
 *                   type: array  
 *                   items:
 *                     $ref: '#/components/schemas/Comment'            
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/:id/comments/:commentId/responses',
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.getResponses);

/**
 * @swagger
 * /items/events/{id}/comments/{commentId}/responses:
 *   post:
 *     summary: Añade una respuesta a un comentario de un evento
 *     tags:
 *       - Events
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del evento
 *         schema:
 *           type: string
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: ID del comentario
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Contenido del comentario
 *                 example: "¡Tienes razón!"
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Respuesta creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Datos inválidos
 *       401: 
 *         description: No autorizado
 *       404:
 *         description: Evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/events/:id/comments/:commentId/responses',
  passport.authenticate('jwt', { session: false }), 
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.createComment);

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
 *         content:
 *          application/json:
 *           schema:
 *             type: object
 *             properties:
 *                success:
 *                  type: booelan
 *                message:
 *                  type: string
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Place'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/places', 
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.getItems);


/**
 * @swagger
 * /items/places/{id}:
 *   get:
 *     summary: Obtiene un lugar por su ID
 *     tags:
 *       - Places
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del lugar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lugar obtenido exitosamente
 *         content: 
 *          application/json:
 *           schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                message:
 *                  type: string
 *                data:
 *                  $ref: '#/components/schemas/Place'
 *       404:
 *         description: Lugar no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/places/:id', 
  (req, res, next) => {
    req.query.type = 'Place';
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
 *       required:
 *         - title
 *         - category
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
 *           type: string
 *           description: Horario de apertura del lugar, expresado en lenguaje natural
 *       required:
 *         - title
 *         - category
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del comentario
 *         user:
 *           type: string
 *           description: ID del usuario que realizó el comentario
 *         text:
 *           type: string
 *           description: Contenido del comentario
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora en que se creó el comentario
 *       required:
 *         - user
 *         - text
 */