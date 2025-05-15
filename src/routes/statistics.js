const express = require('express');

const statisticsController = require('../controllers/statisticsController');
const userController = require('../controllers/userController');
const router = express.Router();
const passport = require('passport');

/**
 * @swagger
 * /statistics/users:
 *   get:
 *     summary: Devuelve la cantidad de usuarios
 *     tags: [Statistics]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         description: Tipo de usuario a contar (activos, inactivos). Por defecto, cuenta todos los usuarios.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devuelve la cantidad de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/users',
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.userCount
);

/**
 * @swagger
 * /statistics/users/{id}/attended-by-category:
 *   get:
 *     summary: Obtiene el conteo de eventos asistidos por categoría para un usuario
 *     tags:
 *       - Statistics
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
 *         description: Conteo de eventos por categoría obtenido exitosamente
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
 *                       category:
 *                         type: string
 *                         description: Categoría del evento
 *                       count:
 *                         type: integer
 *                         description: Número de eventos asistidos en esa categoría
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/users/:id/attended-by-category',
    passport.authenticate('jwt', { session: false }),
    userController.checkAdminOrUser,
    statisticsController.assistedEventsByCategory
);

/**
 * @swagger
 * /statistics/popular-by-category:
 *   get:
 *     summary: Obtiene el conteo de eventos populares por categoría para un usuario
 *     tags:
 *       - Statistics
 *     responses:
 *       200:
 *         description: Conteo de eventos populares por categoría obtenido exitosamente
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
 *                       category:
 *                         type: string
 *                         description: Categoría del evento
 *                       count:
 *                         type: integer
 *                         description: Número de eventos populares en esa categoría
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/popular-by-category',
    statisticsController.eventsByCategory
);

/** @swagger
 * /statistics/users/{id}/upcoming-by-category:
 *   get:
 *     summary: Obtiene el conteo de eventos próximos por categoría para un usuario
 *     tags:
 *       - Statistics
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
 *         description: Conteo de eventos próximos por categoría obtenido exitosamente
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
 *                       category:
 *                         type: string
 *                         description: Categoría del evento
 *                       count:
 *                         type: integer
 *                         description: Número de eventos próximos en esa categoría
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/users/:id/upcoming-by-category',
    passport.authenticate('jwt', { session: false }),
    userController.checkAdminOrUser,
    statisticsController.upcomingByCategory
);

/**
 * @swagger
 * /statistics/events:
 *   get:
 *     summary: Devuelve la cantidad de eventos
 *     tags: [Statistics]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         description: Categoria de eventos a contar. Por defecto, cuenta todos los eventos.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devuelve la cantidad de eventos segun el filtro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/events',
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.eventCount
);

/**
 * @swagger
 * /statistics/visits:
 *   get:
 *     summary: Devuelve la cantidad de visitas por mes
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         description: Rango en meses. Posibles valores 1, 3, 6, 12
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devuelve la cantidad de visitas por mes
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
 *                   example: "Visitas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     months:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           total:
 *                             type: integer
 *                             minimum: 0
 *                           _id:
 *                             type: string
 *                             pattern: '^\d{4}-\d{2}$'
 *                             description: Fecha en formato YYYY-MM
 *                       example:
 *                         - _id: "2025-03"
 *                           total: 0
 *                         - _id: "2025-04"
 *                           total: 0
 *                         - _id: "2025-05"
 *                           total: 4
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/visits',
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.getVisits
);

router.get('/visits/initialize', statisticsController.initializeVisits);

module.exports = router;