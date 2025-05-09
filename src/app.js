var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var itemRouter = require('./routes/items');
var chatsRouter = require('./routes/chats');

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = require('./config/swagger');
const validateJson = require('./middlewares/validateJson');

const db = require('./config/db');
require('./cron/tasks');

var app = express();

db.connectDB();

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
app.use('/chats', chatsRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

module.exports = app;
