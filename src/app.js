require('express-async-errors');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('./logger/logger');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var itemRouter = require('./routes/items');
var chatsRouter = require('./routes/chats');
var statisticsRouter = require('./routes/statistics');

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = require('./config/swagger');
const validateJson = require('./middlewares/validateJson');
const cors = require('cors');
const { createInternalServerErrorResponse } = require('./utils/utils.js');
const logRequests = require('./logger/loggerMiddleware');
const { sendNotification } = require('./mailer/mailer');

const db = require('./config/db');
const env = require('./config/env')

require('./cron/tasks');

var app = express();

db.connectDB();

app.use(cors({
  origin: 'https://culturaviva-frontend.onrender.com',
  credentials: true,
}));

//app.use(validateJson);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const swaggerSpec = swaggerJsdoc(options);

app.use(logRequests); 
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/items', itemRouter)
app.use('/chats', chatsRouter);
app.use('/statistics', statisticsRouter)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'anonymous',
    ip: req.ip,
  });

  if (res.headersSent) {
    return next(err);
  }

  return createInternalServerErrorResponse(res, 'Error interno del servidor');
});

/*
(async () => {
    try {
      await sendNotification({
                  to: "almodovar.juan7@gmail.com",
                  subject: "Test de notificación",
                  text: "Este es un test de notificación"
                });
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    } 
})();*/

/*
const ItemController = require('./controllers/itemController');
const { getEventosCulturales } = require('./processors/agendaZaragoza');
const { getPlaces } = require('./processors/lugares');


(async () => {
    try {
        const eventos = await getEventosCulturales();
        await ItemController.guardarEventos(eventos);
        console.log(`Total eventos obtenidos: ${eventos.length}`);

        const places = await getPlaces();
        await ItemController.guardarLugares(places);
        console.log(`Total lugares obtenidos: ${places.length}`);
    } catch (error) {
        console.error('Error al procesar eventos o lugares:', error);
    }
})();
*/


module.exports = app;
