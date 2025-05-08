const express = require('express');
require('../config/jwtStrategy');
require('../config/googleStrategy');

const authController = require('../controllers/authController');
const router = express.Router();
const passport = require('passport');
const { registerSchema, loginSchema, changePasswordSchema } = require('../schemas/authSchemas');
const validate = require('../middlewares/validateSchema');



/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API para el sistema de autenticación
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               phone:
 *                 type: string
 *                 example: "+123456789"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica si el registro fue exitoso
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Mensaje de éxito
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID único del usuario registrado
 *                       example: "64b7f9c2e4b0f5d1a8c9e123"
 *                     email:
 *                       type: string
 *                       description: Email del usuario registrado
 *                       example: "usuario@example.com"
 *                     name:
 *                       type: string
 *                       description: Nombre del usuario registrado
 *                       example: "Juan Pérez"
 *       400:
 *         description: Campos requeridos faltantes
 *       409:
 *         description: El email ya está registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', 
    validate(registerSchema),
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión con un usuario existente
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Contraseña incorrecta o usuario bloqueado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', 
    validate(loginSchema),
    authController.login,
    authController.generateToken
);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Cambia la contraseña del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       401:
 *         description: Contraseña incorrecta
 *       500:
 *         description: Error interno del servidor
 */
router.post('/change-password', 
    validate(changePasswordSchema),
    passport.authenticate('jwt', { session: false }), 
    authController.changePassword
);


router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
    authController.generateToken
);

module.exports = router;