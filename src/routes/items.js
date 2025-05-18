const express = require('express');
const router = express.Router();
const passport = require('passport');
const validate = require('../middlewares/validateSchema');
const { 
  getSchema, 
  createCommentSchema, 
  deleteCommentSchema, 
  createCommentResponseSchema,
  getItemsSchema
} = require('../schemas/itemsSchemas');

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
 *     summary: Obtiene todos los eventos con filtros opcionales
 *     tags:
 *       - Events
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         description: Filtra eventos por nombre
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         required: false
 *         description: Fecha inicial para filtrar eventos (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         required: false
 *         description: Fecha final para filtrar eventos (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: category
 *         in: query
 *         required: false
 *         description: Filtra eventos por categoría
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         required: false
 *         description: Precio mínimo para filtrar eventos
 *         schema:
 *           type: number
 *       - name: maxPrice
 *         in: query
 *         required: false
 *         description: Precio máximo para filtrar eventos
 *         schema:
 *           type: number
 *       - name: page
 *         in: query
 *         required: false
 *         description: Número de página para la paginación
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Número de elementos por página
 *         schema:
 *           type: integer
 *           default: 16
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Campo por el cual ordenar los resultados (por ejemplo, "date", "category"). Si es "comments", ordena por número de comentarios.
 *         schema:
 *           type: string
 *       - name: order
 *         in: query
 *         required: false
 *         description: Orden de los resultados (asc para ascendente, desc para descendente)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Lista de eventos obtenida exitosamente
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events',
  validate(getItemsSchema),
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.getItems);

/**
 * @swagger
 * /items/events/categories:
 *   get:
 *     summary: Obtiene todas las categorías de eventos
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: Lista de categorías de eventos obtenida exitosamente
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
 *                   example: "Categorías obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events/categories',
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.getCategories);

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
 *       - name: fields
 *         in: query
 *         required: false
 *         description: Campos a incluir en la respuesta (separados por comas)
 *         schema:
 *          type: string
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
  validate(getSchema),
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
  validate(getSchema),
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
  validate(createCommentSchema),
  passport.authenticate('jwt', { session: false }), 
  (req, res, next) => {
    req.query.type = 'Event';
    next();
  }, 
  itemController.createComment);

/**
 * @swagger
 * /items/events/{id}/comments/{commentId}:
 *   delete:
 *     summary: Elimina un comentario de un evento
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
 *       - name: motivo
 *         in: query
 *         required: false
 *         description: Motivo de la eliminación
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
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
 *                   example: "Comentario eliminado exitosamente"
 *       404:
 *         description: Comentario o evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/events/:id/comments/:commentId',
  validate(deleteCommentSchema),
  passport.authenticate('jwt', { session: false }),
  itemController.deleteComment
);

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
  validate(deleteCommentSchema),
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
  validate(createCommentResponseSchema),
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
 *     summary: Obtiene todos los lugares con filtros opcionales
 *     tags:
 *       - Places
 *     parameters:
 *       - name: name
 *         in: query
 *         required: false
 *         description: Filtra lugares por nombre
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         required: false
 *         description: Fecha inicial para filtrar eventos (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         required: false
 *         description: Fecha final para filtrar eventos (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: category
 *         in: query
 *         required: false
 *         description: Filtra lugares por categoría
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         required: false
 *         description: Precio mínimo para filtrar eventos
 *         schema:
 *           type: number
 *       - name: maxPrice
 *         in: query
 *         required: false
 *         description: Precio máximo para filtrar eventos
 *         schema:
 *           type: number
 *       - name: page
 *         in: query
 *         required: false
 *         description: Número de página para la paginación
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Número de elementos por página
 *         schema:
 *           type: integer
 *           default: 16
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Campo por el cual ordenar los resultados (por ejemplo, "date", "category"). Si es "comments", ordena por número de comentarios.
 *         schema:
 *           type: string
 *       - name: order
 *         in: query
 *         required: false
 *         description: Orden de los resultados (asc para ascendente, desc para descendente)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Lista de lugares obtenida exitosamente
 *         content: 
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Place'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/places', 
  validate(getItemsSchema),
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.getItems);

/**
 * @swagger
 * /items/places/categories:
 *   get:
 *     summary: Obtiene todas las categorías de lugares
 *     tags:
 *       - Places
 *     responses:
 *       200:
 *         description: Lista de categorías de lugares obtenida exitosamente
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
 *                   example: "Categorías obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/places/categories',
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.getCategories);


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
 *       - name: fields
 *         in: query
 *         required: false
 *         description: Campos a incluir en la respuesta (separados por comas)
 *         schema:
 *          type: string
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
  validate(getSchema),
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.getItemById);


/**
 * @swagger
 * /items/places/{id}/comments:
 *   get:
 *     summary: Obtiene los comentarios de un lugar por su ID
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
 *         description: Lugar no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/places/:id/comments',
  validate(getSchema),
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.getItemComments);

/**
 * @swagger
 * /items/places/{id}/comments:
 *   post:
 *     summary: Crea un comentario para un lugar
 *     tags:
 *       - Places
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del lugar
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
 *                 example: "Este lugar fue increíble"
 *               value:
 *                 type: number
 *                 description: Valoración opcional del lugar
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
 *         description: Lugar no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/places/:id/comments',
  validate(createCommentSchema),
  passport.authenticate('jwt', { session: false }), 
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.createComment);

/**
 * @swagger
 * /items/places/{id}/comments/{commentId}:
 *   delete:
 *     summary: Elimina un comentario de un lugar
 *     tags:
 *       - Places
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del lugar
 *         schema:
 *           type: string
 *       - name: commentId
 *         in: path
 *         required: true
 *         description: ID del comentario
 *         schema:
 *           type: string
 *       - name: motivo
 *         in: query
 *         required: false
 *         description: Motivo de la eliminación
 *         schema: 
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
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
 *                   example: "Comentario eliminado exitosamente"
 *       404:
 *         description: Comentario o evento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/places/:id/comments/:commentId',
  validate(deleteCommentSchema),
  passport.authenticate('jwt', { session: false }),
  itemController.deleteComment
);

/**
 * @swagger
 * /items/places/{id}/comments/{commentId}/responses:
 *   get:
 *     summary: Obtiene las respuestas de un comentario de un lugar por su ID
 *     tags:
 *       - Places
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del lugar
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
router.get('/places/:id/comments/:commentId/responses',
  validate(deleteCommentSchema),
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.getResponses);

/**
 * @swagger
 * /items/places/{id}/comments/{commentId}/responses:
 *   post:
 *     summary: Añade una respuesta a un comentario de un lugar
 *     tags:
 *       - Places
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del lugar
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
router.post('/places/:id/comments/:commentId/responses',
  validate(createCommentResponseSchema),
  passport.authenticate('jwt', { session: false }), 
  (req, res, next) => {
    req.query.type = 'Place';
    next();
  }, 
  itemController.createComment);

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
 *           pattern: "^[0-9a-fA-F]{24}$"
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
 *           type: array
 *           description: Información de precios del evento
 *           items:
 *             $ref: '#/components/schemas/PriceItem'
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
 *           description: Nombre del lugar donde se realiza el evento
 *         itemType: 
 *          type: string
 *          description: Tipo de ítem (Evento o Lugar)
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
 *           pattern: "^[0-9a-fA-F]{24}$"
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
 *           type: array
 *           description: Información de precios del evento
 *           items:
 *             $ref: '#/components/schemas/PriceItem'
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
 *         itemType: 
 *          type: string
 *          description: Tipo de ítem (Evento o Lugar)
 *       required:
 *         - title
 *         - category
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PriceItem:
 *       type: object
 *       properties:
 *         grupo:
 *           type: string
 *           description: Grupo al que aplica el precio (por ejemplo, "Adultos", "Niños")
 *         precio:
 *           type: integer
 *           nullable: true
 *           description: Precio asociado al grupo (puede ser `null` si no aplica)
 */