const express = require('express');

const statisticsController = require('../controllers/statisticsController');
const userController = require('../controllers/userController');
const router = express.Router();
const passport = require('passport');
const validate = require('../middlewares/validateSchema');

const { 
    getSchema, 
    getUsersSchema, 
    getEventsCategorySchema, 
    getVisitsSchema 
} = require('../schemas/statisticsSchema');

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
    validate(getUsersSchema),
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
    validate(getSchema),
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
 *     parameters:
 *       - in: query
 *         name: itemType
 *         schema:
 *          type: string
 *          enum: [Event, Place]
 *          description: Filtrar por tipo de ítem (Event o Place)
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
    statisticsController.popularByCategory
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
    validate(getSchema),
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
    validate(getEventsCategorySchema),
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.eventCount
);

/**
 * @swagger
 * /statistics/visits:
 *   get:
 *     summary: Devuelve la cantidad de visitas a lo largo del tiempo
 *     tags:
 *       - Statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         description: Rango de tiempo. Posibles valores 1w, 1m, 3m, 6m, 9m, 12m
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conteo de visitas obtenido exitosamente
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
 *                   example: "Conteo de visitas obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/TimeStat"
 *                   example:
 *                     stats:
 *                       - total: 0
 *                         id: "2025-05-16"
 *                         name: null
 *                         number: 16
 *                       - total: 0
 *                         id: "2025-05-18"
 *                         name: null
 *                         number: 18
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/visits',
    validate(getVisitsSchema),
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.getVisits
);

/**
 * @swagger
 * /statistics/disable-users:
 *   get:
 *     summary: Devuelve la cantidad de usuarios deshabilitados a lo largo del tiempo
 *     tags:
 *       - Statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         description: Rango de tiempo. Posibles valores 1w, 1m, 3m, 6m, 9m, 12m
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - 1w
 *             - 1m
 *             - 3m
 *             - 6m
 *             - 9m
 *             - 12m
 *     responses:
 *       200:
 *         description: Conteo de usuarios deshabilitados obtenido exitosamente
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
 *                   example: "Conteo de usuarios deshabilitados obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/TimeStat"
 *                   example:
 *                     stats:
 *                       - total: 0
 *                         id: "2025-05-16"
 *                         name: null
 *                         number: 16
 *                       - total: 0
 *                         id: "2025-05-18"
 *                         name: null
 *                         number: 18
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/disable-users',
    validate(getVisitsSchema),
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.getDisableUsersCount
);

/**
 * @swagger
 * /statistics/comments:
 *   get:
 *     summary: Devuelve el numero de comentarios añadidos vs borrados
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         description: Rango en meses. Posibles valores 1w, 1m, 3m, 6m, 9m, 12m
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Devuelve el numero de comentarios añadidos vs borrados
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
 *                   example: "Estadísticas de comentarios obtenidas exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       totalEliminated:
 *                         type: integer
 *                         minimum: 0
 *                       totalAdded:
 *                         type: integer
 *                         minimum: 0
 *                   example:
 *                     - totalEliminated: 4 
 *                       totalAdded: 3
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/comments',
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.getCommentsStatistics
);

/**
 * @swagger
 * /statistics/saved-events:
 *   get:
 *     summary: Devuelve el número de items guardados a lo largo del tiempo
 *     tags:
 *       - Statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: range
 *         description: Rango de tiempo. Posibles valores 1w, 1m, 3m, 6m, 9m, 12m
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - 1w
 *             - 1m
 *             - 3m
 *             - 6m
 *             - 9m
 *             - 12m
 *     responses:
 *       200:
 *         description: Conjunto de items guardados obtenido exitosamente
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
 *                   example: "Conjunto de items guardados obtenido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/TimeStat"
 *                   example:
 *                     stats:
 *                       - total: 0
 *                         id: "2025-05-16"
 *                         name: null
 *                         number: 16
 *                       - total: 0
 *                         id: "2025-05-18"
 *                         name: null
 *                         number: 18
 *       403:
 *         description: Acceso denegado
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     Stat:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           minimum: 0
 *           description: Conteo de eventos en ese periodo
 *         id:
 *           type: string
 *           pattern: '^\d{4}-\d{2}(-\d{2})?$'
 *           description: Fecha en formato YYYY-MM (mensual) o YYYY-MM-DD (diario)
 *         name:
 *           type: string
 *           nullable: true
 *           description: Nombre del mes o del día de la semana
 *         number:
 *           type: integer
 *           nullable: true
 *           description: Día del mes (solo en agrupación diaria)
 *       example:
 *         total: 0
 *         id: "2025-05-18"
 *         name: "Domingo"
 *         number: 18
 */
router.get('/saved-events',
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.getSavedEventCount
);

router.get('/initialize', 
    passport.authenticate('jwt', { session: false }),
    userController.checkAdmin,
    statisticsController.initializeVisits
);

module.exports = router;

/**
 * * components:
 *   schemas:
 *     TimeStat:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           minimum: 0
 *           description: Conteo de eventos en ese periodo
 *         id:
 *           type: string
 *           pattern: '^\d{4}-\d{2}(-\d{2})?$'
 *           description: Fecha en formato YYYY-MM (mensual) o YYYY-MM-DD (diario)
 *         name:
 *           type: string
 *           nullable: true
 *           description: Nombre del mes (cuando es agrupación mensual) o nombre del día (cuando es agrupación diaria)
 *         number:
 *           type: integer
 *           nullable: true
 *           description: Día del mes (solo presente en agrupación diaria)
 *       example:
 *         total: 0
 *         id: "2025-05-18"
 *         name: "Domingo"
 *         number: 18
 */