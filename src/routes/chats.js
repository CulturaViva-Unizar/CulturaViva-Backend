const express = require('express');
const passport = require('passport');
require('../config/jwtStrategy');

const chatController = require('../controllers/chatController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Gestión de chats entre usuarios
 */

/**
 * @swagger
 * /chats:
 *   post:
 *     summary: Crea un nuevo chat entre dos usuarios
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user1:
 *                 type: string
 *                 description: ID del primer usuario
 *               user2:
 *                 type: string
 *                 description: ID del segundo usuario
 *     responses:
 *       201:
 *         description: Chat creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Error en la validación o usuarios iguales
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes acceso a este chat
 *       409: 
 *         description: Chat ya existe entre los usuarios
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  chatController.checkIsUser,
  chatController.createChat
);

/**
 * @swagger
 * /chats/:chatId:
 *   delete:
 *     summary: Elimina un chat por su ID, así como todos los mensajes asociados.
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del chat a eliminar
 *     responses:
 *       200:
 *         description: Chat eliminado exitosamente
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
 *                   example: "Chat eliminado exitosamente"
 *       404:
 *         description: Chat no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes acceso a este chat
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  '/:chatId',
  passport.authenticate('jwt', { session: false }),
  chatController.checkUserInChat,
  chatController.deleteChat
);

/**
 * @swagger
 * /chats/:chatId:
 *   get:
 *     summary: Obtiene un chat completo por su ID
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID del chat que se desea obtener
 *     responses:
 *       200:
 *         description: Chat obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Chat no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes acceso a este chat
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:chatId',
  passport.authenticate('jwt', { session: false }),
  chatController.checkUserInChat,
  chatController.getChatById
);


/**
 * @swagger
 * /chats/:chatId/messages:
 *   get:
 *     summary: Obtiene todos los mensajes de un chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         description: ID del chat del que se obtendrán los mensajes
 *     responses:
 *       200:
 *         description: Lista de mensajes obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Message'
 *       404:
 *         description: Chat no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes acceso a este chat
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/:chatId/messages',
  passport.authenticate('jwt', { session: false }),
  chatController.getChatMessages
);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del chat
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         user1:
 *           type: string
 *           description: ID del primer usuario
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         user2: 
 *           type: string
 *           description: ID del segundo usuario
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del chat
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización del chat
 *       required:
 *        - id
 *        - user1
 *        - user2
 *        - createdAt
 *        - updatedAt
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del mensaje
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         text:
 *           type: string
 *           description: Texto del mensaje
 *           example: "Hola, ¿cómo estás?"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora en que se envió el mensaje
 *         user:
 *           type: string
 *           description: ID del usuario que envió el mensaje
 *           pattern: "^[0-9a-fA-F]{24}$"
 *         chat:
 *           type: string
 *           description: ID del chat al que pertenece el mensaje
 *           pattern: "^[0-9a-fA-F]{24}$"
 *       required:
 *         - id
 *         - text
 *         - timestamp
 *         - user
 *         - chat
 */

