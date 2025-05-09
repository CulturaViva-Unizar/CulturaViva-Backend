const express = require('express');
require('../config/jwtStrategy');
require('../config/googleStrategy');
require('../config/facebookStrategy');

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
 *     summary: Registra un nuevo usuario y devuelve token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registro exitoso con token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Faltan campos requeridos
 *       409:
 *         description: El email ya está registrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', 
    validate(registerSchema),
    authController.register,
    authController.generateToken
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso con token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales incorrectas
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
 *                   example: "Contraseña restablecida exitosamente"
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

/**
* @swagger
* /auth/google:
*   get:
*     summary: Redirige a Google para auth o retorna token
*     tags: [Auth]
*     responses:
*       200:
*         description: Login exitoso con token
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/AuthResponse'
*       401:
*         description: Credenciales incorrectas
*       500:
*         description: Error interno del servidor
*/
router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
    authController.generateToken
);

/**
* @swagger
* /auth/facebook:
*   get:
*     summary: Redirige a Facebook para auth
*     tags: [Auth]
*     responses:
*       200:
*         description: Login exitoso con token
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/AuthResponse'
*       401:
*         description: Credenciales incorrectas
*       500:
*         description: Error interno del servidor
*/
router.get('/facebook', 
    passport.authenticate('facebook')
);

router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/auth/login' }),
    authController.generateToken
);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     UserDto:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - name
 *         - admin
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           description: ObjectId del usuario
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         admin:
 *           type: boolean
 *         type:
 *           type: string
 *           description: Tipo de usuario (discriminatorKey)
 *     AuthData:
 *       type: object
 *       required:
 *         - user
 *         - accessToken
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/UserDto'
 *         accessToken:
 *           type: string
 *           description: JWT válido por env.JWT_EXPIRES
 *     AuthResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/AuthData'
 */