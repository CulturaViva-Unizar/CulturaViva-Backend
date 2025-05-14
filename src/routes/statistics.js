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
 * /statistics/events:
 *   get:
 *     summary: Devuelve la cantidad de usuarios
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