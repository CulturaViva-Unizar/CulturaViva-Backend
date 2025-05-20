const express = require('express');
require('../config/jwtStrategy');
require('../config/googleStrategy');
require('../config/facebookStrategy');
require('../config/twitterStrategy');
require('../config/githubStrategy');

const env = require('../config/env');
const authController = require('../controllers/authController');
const router = express.Router();
const passport = require('passport');
const { registerSchema, loginSchema, changePasswordSchema } = require('../schemas/authSchemas');
const validate = require('../middlewares/validateSchema');
const { createUserDto, signJwt } = require('../utils/authUtils');
const logger = require('../logger/logger');



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
router.get('/google', (req, res, next) => {
    const redirect = req.query.origin || env.FRONTEND_URL;
    const state = Buffer.from(redirect).toString('base64url');

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        state,
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err && err.status === 409) {
            return res.status(409).json({
                success: false,
                message: 'Este email ya está registrado con otro método de acceso.',
            });
        }

        if (err) return next(err);

        const redirectBase = (() => {
            try {
                return Buffer.from(req.query.state, 'base64url').toString();
            } catch {
                return env.FRONTEND_URL;
            }
        })();


        if (!user) {
            return res.redirect(`${redirectBase}/login`);
        }

        const token = signJwt(user);
        const userB64 = Buffer
            .from(JSON.stringify(createUserDto(user)))
            .toString('base64url');

        return res.redirect(
            `${redirectBase}/login/success?token=${token}&user=${userB64}`,
        );
    })(req, res, next);
});

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
router.get('/facebook', (req, res, next) => {
    const redirect = req.query.origin || env.FRONTEND_URL;
    const state = Buffer.from(redirect).toString('base64url');

    passport.authenticate('facebook', {
        scope: ['public_profile', 'email'],
        state,
    })(req, res, next);
});

router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, user, info) => {
        if (err) {
            if (err.status === 409) {
                return res.status(409).json({
                    success: false,
                    message: 'Este email ya está registrado con otro método de acceso.',
                });
            }

            return next(err);
        }

        const redirectBase = (() => {
            try {
                return Buffer.from(req.query.state, 'base64url').toString();
            } catch {
                return env.FRONTEND_URL;
            }
        })();

        if (!user) {
            return res.redirect(`${redirectBase}/login`);
        }

        const token = signJwt(user);
        const userB64 = Buffer.from(JSON.stringify(createUserDto(user))).toString('base64url');

        return res.redirect(`${redirectBase}/login/success?token=${token}&user=${userB64}`);
    })(req, res, next);
});

/**
* @swagger
* /auth/twitter:
*   get:
*     summary: Redirige a Twitter para auth
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
router.get('/twitter', (req, res, next) => {
    const redirect = req.query.origin || env.FRONTEND_URL;
    const state = Buffer.from(redirect).toString('base64url');

    passport.authenticate('twitter', {
        scope: ['tweet.read', 'users.read', 'offline.access', 'users.email'],
        state,
    })(req, res, next);
});

router.get('/twitter/callback', (req, res, next) => {
    console.log('🚨 Callback recibido de Twitter');
    console.log('🔍 Query recibida:', req.query);
    passport.authenticate('twitter', { session: false }, (err, user, info) => {
        if (err) {
            if (err.status === 409) {
                return res.status(409).json({
                    success: false,
                    message: 'Este email ya está registrado con otro método de acceso.',
                });
            }

            return next(err);
        }

        const redirectBase = (() => {
            try {
                return Buffer.from(req.query.state, 'base64url').toString();
            } catch {
                return env.FRONTEND_URL;
            }
        })();

        if (!user) {
            return res.redirect(`${redirectBase}/login`);
        }

        const token = signJwt(user);
        const userB64 = Buffer.from(JSON.stringify(createUserDto(user))).toString('base64url');

        return res.redirect(`${redirectBase}/login/success?token=${token}&user=${userB64}`);
    })(req, res, next);
});

router.get('/github', (req, res, next) => {
  const redirect = req.query.origin || env.FRONTEND_URL;
  const state = Buffer.from(redirect).toString('base64url');

  passport.authenticate('github', {
    scope: ['user:email'],
    state,
  })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  console.log('🚨 Callback recibido de GitHub');
  console.log('🔍 Query recibida:', req.query);

  passport.authenticate('github', { session: false }, (err, user, info) => {
    if (err) return next(err);

    const redirectBase = (() => {
      try {
        return Buffer.from(req.query.state, 'base64url').toString();
      } catch {
        return env.FRONTEND_URL;
      }
    })();

    if (!user) {
      return res.redirect(`${redirectBase}/login`);
    }

    const token = signJwt(user);
    const userB64 = Buffer.from(JSON.stringify(createUserDto(user))).toString('base64url');

    return res.redirect(`${redirectBase}/login/success?token=${token}&user=${userB64}`);
  })(req, res, next);
});


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