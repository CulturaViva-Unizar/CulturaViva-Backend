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

router.get('/events', 
    //passport.authenticate('jwt', { session: false }),
    //userController.checkAdmin, 
    statisticsController.eventCount
);

module.exports = router;