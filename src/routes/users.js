const express = require('express');
const passport = require('passport');
require('../config/jwtStrategy');

const userController = require('../controllers/userController');
const { checkAdminOrUser } = require('../controllers/userController');

const validate = require('../middlewares/validateSchema');

const 
  {  
    getSchema,
    getEventsSchema,
    updateUserSchema,
    saveEventSchema,
    deleteEventSchema,  
    getRecommendedItemsSchema,
    getUpcomingEventsSchema,
    deleteAttendingEventSchema
  } = require('../schemas/userSchemas');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API para la gestión de usuarios
 */


/**
 * @swagger
 * /users:
 *  get:
 *    summary: Obtiene todos los usuarios
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *           ype: integer
 *        description: Número de página
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: Límite de resultados por página
 *      - in: query
 *        name: userType
 *        schema:
 *          type: string
 *        description: Tipo de usuario (Habilitados o Deshabilitados)
 *      - in: query
 *        name: name
 *        schema: 
 *          type: string
 *        description: Nombre del usuario
 *      - in: query
 *        name: order
 *        schema: 
 *          type: string
 *        description: Ordenar por comentarios "asc" o "desc"
 *    responses:
 *     200:
 *      description: Lista de usuarios obtenida exitosamente
 *      content:
 *       application/json:
 *        schema:
 *         type: object
 *         properties:
 *           success:
 *             type: boolean
 *           message:
 *             type: string
 *           data:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/User'
 *     401:
 *      description: No autorizado
 *     500:
 *      description: Error interno del servidor
 */
router.get('/', 
  passport.authenticate('jwt', { session: false }), 
  userController.checkAdmin, 
  userController.getUsers);

/**
 * @swagger
 * /users/popular-events:
 *   get:
 *     summary: Obtiene los ítems mas populares
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría del evento
 *       - in: query
 *         name: itemType
 *         schema:
 *          type: string
 *          enum: [Event, Place]
 *          description: Filtrar por tipo de ítem (Event o Place)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de eventos populares obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/popular-events',
  userController.getPopularEvents
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', 
  validate(getSchema),
  passport.authenticate('jwt', { session: false }), 
  userController.checkAdminOrUser,
  userController.getUserById);


/**
 * @swagger
 * /users/{id}/saved-events:
 *   get:
 *     summary: Obtiene los eventos guardados por el usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del evento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha inicial del evento
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha final del evento
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría del evento
 *       - in: query
 *         name: itemType
 *         schema:
 *          type: string
 *         description: Filtrar por tipo de ítem (Event o Place)
 *       - in: query
 *         name: sort 
 *         schema:
 *          type: string
 *          description: Campo por el que se ordena (comments, date). Si es comments, se ordena por el número de comentarios.
 *       - in: query
 *         name: order
 *         schema:
 *          type: string
 *          enum: [asc, desc]
 *          description: Orden de la lista (asc o desc)
 *          default: asc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de eventos guardados obtenida exitosamente
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
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/saved-events', 
  validate(getEventsSchema),
  passport.authenticate('jwt', { session: false }), 
  userController.checkAdminOrUser,
  userController.getSavedItems);


/**
 * @swagger
 * /users/{id}/attended-events:
 *   get:
 *     summary: Obtiene los eventos a los que el usuario ya ha asistido. Historial de eventos pasados asistidos 
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del evento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Obtiene eventos con fecha incial >= startDate (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Obtiene eventos con fecha final <= endDate (YYYY-MM-DD)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría del evento
 *       - in: query
 *         name: sort 
 *         schema:
 *          type: string
 *          description: Campo por el que se ordena (comments, date). Si es comments, se ordena por el número de comentarios.
 *       - in: query
 *         name: order
 *         schema:
 *          type: string
 *          enum: [asc, desc]
 *          description: Orden de la lista (asc o desc)
 *          default: asc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de eventos asistidos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/attended-events', 
  validate(getEventsSchema),
  passport.authenticate('jwt', { session: false }),
  userController.checkAdminOrUser, 
  userController.getAttendedItems);


/**
 * @swagger
 * /users/{id}/recommended-items:
 *   get:
 *     summary: Obtiene recomendaciones personalizadas para el usuario
 *     description: |
 *       Devuelve una lista de eventos o lugares recomendados para el usuario, basada en las 3 categorías a las que más ha asistido.
 *       Si el tipo es 'Event', solo se devuelven eventos que ocurren en el próximo mes, y que todavía no han empezado. 
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Event, Place]
 *         description: Tipo de ítem a recomendar (por defecto, Event)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Campo por el que ordenar los resultados (por defecto, startDate)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Orden ascendente o descendente (por defecto, asc)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de recomendaciones obtenida exitosamente
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
 *                   example: Recomendaciones obtenidas exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado o sin recomendaciones
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/recommended-items',
  validate(getRecommendedItemsSchema),
  passport.authenticate('jwt', { session: false }),
  userController.checkAdminOrUser,
  userController.getRecommendedItems
);

/**
 * @swagger
 * /users/{id}/upcoming-events:
 *   get:
 *     summary: Obtiene los eventos mas proximos a los que vas a asistir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría del evento
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de eventos populares obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/upcoming-events',
  validate(getUpcomingEventsSchema),
  passport.authenticate('jwt', { session: false }),
  userController.checkAdminOrUser, 
  userController.getUpcomingEvents
);


/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualiza el perfil del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: motivo 
 *         required: false
 *         schema:
 *           type: string
 *         description: Motivo de la actualización
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

router.put('/:id', 
  validate(updateUserSchema),
  passport.authenticate('jwt', { session: false }), 
  userController.checkAdminOrUser,
  userController.updateProfile);


/**
 * @swagger
 * /users/{id}/saved-events:
 *   post:
 *     summary: Guarda un evento en el perfil del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evento guardado exitosamente
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
 *                   type: object
 *                   properties: 
 *                      items:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:id/saved-events', 
  validate(saveEventSchema),
  passport.authenticate('jwt', { session: false }), 
  userController.checkAdminOrUser,
  userController.saveItem);


/**
 * @swagger
 * /users/{id}/attending-events:
 *   post:
 *     summary: Marca un evento como asistido por el usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
*     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evento marcado como asistido exitosamente
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
 *                   type: object
 *                   properties: 
 *                      items:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

router.post('/:id/attending-events', 
  validate(saveEventSchema),
  passport.authenticate('jwt', { session: false }),
  userController.checkAdminOrUser, 
  userController.attendItem);


/**
 * @swagger
 * /users/{id}/saved-events/{eventId}:
 *   delete:
 *     summary: Elimina un evento guardado del perfil del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento a eliminar
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
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
 *                   type: object
 *                   properties: 
 *                      items:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/saved-events/:eventId', 
  validate(deleteEventSchema),
  passport.authenticate('jwt', { session: false }), 
  userController.checkAdminOrUser,
  userController.removeSavedItem);


/**
 * @swagger
 * /users/{id}/attending-events/{eventId}:
 *   delete:
 *     summary: Elimina un evento asistido del perfil del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *       - name: eventId
 *         in: path  
 *         required: true
 *         description: ID del evento a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
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
 *                     type: string
 *                     pattern: "^[0-9a-fA-F]{24}$"
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id/attending-events/:eventId', 
  validate(deleteAttendingEventSchema),
  passport.authenticate('jwt', { session: false }),
  userController.checkAdminOrUser,
  userController.removeAttendingItem);

/**
 * @swagger
 * /users/{id}/comments:
 *   get:
 *     summary: Obtiene los comentarios de un usuario por su ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Comentarios obtenidos exitosamente
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         pattern: "^[0-9a-fA-F]{24}$"
 *                       text:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             pattern: "^[0-9a-fA-F]{24}$"
 *                           name:
 *                             type: string
 *                       event:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             pattern: "^[0-9a-fA-F]{24}$"
 *                           title:
 *                             type: string
 *                           itemType:
 *                             type: string
 *                             enum: [Event, Place]
 *                       value:
 *                         type: number
 *                         description: Valoración (solo para Valoration)
 *                       responseTo:
 *                         type: string
 *                         pattern: "^[0-9a-fA-F]{24}$"
 *                         description: Referencia al comentario padre (solo para Response)
 *       404:
 *         description: Usuario o comentarios no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/comments',
  validate(getSchema),
  passport.authenticate('jwt', { session: false }), 
  userController.checkAdminOrUser, 
  userController.getUserComments);  

/**
 * @swagger
 * /users/{id}/chats:
 *   get:
 *     summary: Obtiene todos los chats de un usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de chats obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:id/chats',
  validate(getSchema),
  passport.authenticate('jwt', { session: false }),
  userController.checkAdminOrUser,
  userController.getUserChats
);


/**
 * @swagger
 * /users/{id}/make-admin:
 *   put:
 *     summary: Promueve a un usuario a administrador
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a promover
 *     responses:
 *       200:
 *         description: Usuario promovido exitosamente
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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/make-admin',
  validate(getSchema),
  passport.authenticate('jwt', { session: false }),
  userController.checkAdmin,
  userController.makeAdmin
);


module.exports = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         active:
 *           type: boolean
 *         admin:
 *           type: boolean
 *         userType:
 *           type: string
 *         commentCount:
 *           type: integer
 *           description: Número total de comentarios
 *         commentCountEnabled:
 *           type: integer
 *           description: Número de comentarios habilitados
 *         commentCountDisabled:
 *           type: integer
 *           description: Número de comentarios deshabilitados
 *       required:
 *         - id
 *         - name
 *         - email
 *         - phone
 *         - createdAt
 *         - active
 *         - admin
 *         - userType
 *         - commentCount
 *         - commentCountEnabled
 *         - commentCountDisabled
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
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         text:
 *           type: string
 *           description: Texto del comentario
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha en la que se creó el comentario
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ID único del usuario
 *               pattern: "^[0-9a-fA-F]{24}$"
 *             name:
 *               type: string
 *               description: Nombre del usuario
 *         event:
 *           type: string
 *           description: ID del evento al que pertenece el comentario
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         value: 
 *            type: number
 *            description: Valoración del evento
 *         responseTo:
 *            type: string
 *            description: ID del comentario al que se responde
 *            pattern: "^[0-9a-fA-F]{24}$"
 *       required:
 *         - id
 *         - text
 *         - user
 *         - date
 *         - event
 */
