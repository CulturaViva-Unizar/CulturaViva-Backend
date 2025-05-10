require('express-async-errors');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var itemRouter = require('./routes/items');
var statisticsRouter = require('./routes/statistics');

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = require('./config/swagger');
const validateJson = require('./middlewares/validateJson');
const cors = require('cors');
const { createInternalServerErrorResponse } = require('./utils/utils.js');

const db = require('./config/db');
require('./cron/tasks');

var app = express();

db.connectDB();

app.use(cors());

//app.use(validateJson);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const swaggerSpec = swaggerJsdoc(options);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/items', itemRouter)
app.use('/statistics', statisticsRouter)

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    if (res.headersSent) {
        return next(err)
    };
    return createInternalServerErrorResponse(res, 'Error interno del servidor');
});

module.exports = app;
