const express = require('express');
const passport = require('passport');
require('../config/jwtStrategy');
const validate = require('../middlewares/validateSchema');
const { createChatSchema, getChatMessagesSchema } = require('../schemas/chatSchemas');

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
 *               user:
 *                 type: string
 *                 description: ID del usuario con el que se desea chatear
 *             required:
 *               - user
 *     responses:
 *       201:
 *         description: Chat creado exitosamente
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
 *                   example: "Chat creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Error en la validación o usuarios iguales
 *       401:
 *         description: No autorizado
 *       409: 
 *         description: Chat ya existe entre los usuarios
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/',
  validate(createChatSchema),
  passport.authenticate('jwt', { session: false }),
  chatController.createChat
);


/**
 * @swagger
 * /chats/{chatId}/messages:
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
 *                 message:
 *                   type: string
 *                   example: "Mensajes del chat encontrados"
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
  validate(getChatMessagesSchema),
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
 *         user:
 *           type: object
 *           properties:
 *            id:
 *              type: string
 *              description: ID del usuario remoto
 *              pattern: "^[0-9a-fA-F]{24}$"
 *            name:
 *              type: string
 *              description: Nombre del usuario remoto
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
 *        - user
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

