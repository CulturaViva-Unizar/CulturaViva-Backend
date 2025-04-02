const express = require('express');
const passport = require('passport');
require('../config/passport');
const adminController = require('../controllers/adminController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API para la gestión de usuarios y roles de administrador
 */


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users', 
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.getUsers);


/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users/:userId', 
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.getUserById);


/**
 * @swagger
 * /users/{userId}/comments:
 *   get:
 *     summary: Obtiene los comentarios de un usuario por su ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentarios obtenidos exitosamente
 *       404:
 *         description: Usuario o comentarios no encontrados
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users/:userId/comments',
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.getUserComments);


/**
 * @swagger
 * /users/{userId}/block:
 *   patch:
 *     summary: Bloquea un usuario
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario bloqueado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/users/:userId/block', 
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.blockUser);


/**
 * @swagger
 * /users/{userId}/unblock:
 *   patch:
 *     summary: Desbloquea un usuario
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario desbloqueado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/users/:userId/unblock', 
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.unblockUser);


/**
 * @swagger
 * /users/{userId}/admin:
 *   patch:
 *     summary: Asigna el rol de admin a un usuario
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario asignado como admin exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/users/:userId/admin', 
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.makeAdmin);


/**
 * @swagger
 * /users/{userId}/removeAdmin:
 *   patch:
 *     summary: Elimina el rol de admin de un usuario
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rol de admin eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/users/:userId/removeAdmin', 
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.removeAdmin);


/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Elimina un usuario
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/users/:userId', 
    passport.authenticate('jwt', { session: false }), 
    adminController.checkAdmin, 
    adminController.deleteUser);

module.exports = router;