const express = require('express');
const passport = require('passport');
require('../config/jwtStrategy');

const userController = require('../controllers/userController');
const { checkAdminOrUser } = require('../controllers/userController');

const validate = require('../middlewares/validateSchema');

const 
   {  
    getUserByIdSchema,
    getEventsSchema,
    updateUserSchema,
    saveEventSchema,
    deleteEventSchema,
    getUserCommentsSchema 
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
 *     - bearerAuth: []
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
 *     summary: Obtiene los eventos mas populares
 *     tags: [Users]
 *     parameters:
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
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha del evento
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
    passport.authenticate('jwt', { session: false }), 
    userController.getSavedItems);


/**
 * @swagger
 * /users/{id}/attending-events:
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
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha del evento
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
router.get('/:id/attend-events', 
    passport.authenticate('jwt', { session: false }), 
    userController.getAttendingItems);

/**
 * @swagger
 * /users/upcoming-events:
 *   get:
 *     summary: Obtiene los eventos mas proximos a los que vas a asistir
 *     tags: [Users]
 *     parameters:
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
    passport.authenticate('jwt', { session: false }), 
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
    checkAdminOrUser,
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
    userController.attendItem);


/**
 * @swagger
 * /users/{id}/saved-events/:eventId:
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
    passport.authenticate('jwt', { session: false }), 
    userController.removeSavedItem);


/**
 * @swagger
 * /users/{id}/attending-events/:eventId:
 *   delete:
 *     summary: Elimina un evento asistido del perfil del usuario
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
    passport.authenticate('jwt', { session: false }), 
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
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
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
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Usuario o comentarios no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/comments',
    passport.authenticate('jwt', { session: false }), 
    //userController.checkAdminOrUser, 
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
  passport.authenticate('jwt', { session: false }),
  userController.checkAdminOrUser,
  userController.getUserChats
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
 *           description: ID único del usuario
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           description: Correo electrónico del usuario
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del usuario
 *         active: 
 *           type: boolean
 *           description: Indica si el usuario está activo
 *         admin:
 *           type: boolean
 *           description: Indica si el usuario es administrador
 *         userType:
 *           type: String
 *           description: Indica el tipo de usuario (password, facebook, google)
 *           
 *       required: 
 *         - id
 *         - name
 *         - email
 *         - phone
 *         - createdAt
 *         - active
 *         - admin
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
