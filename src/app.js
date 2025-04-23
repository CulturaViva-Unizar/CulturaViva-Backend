var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var itemRouter = require('./routes/items');

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = require('./config/swagger');
const validateJson = require('./middlewares/validateJson');

const ItemController = require('./controllers/itemController');
const { getPlaces } = require('./processors/lugares');

const db = require('./config/db');

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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

async function debugEventosCulturales() {
  try {
    let places = await getPlaces(); // Obtiene los lugares culturales+
    console.log(places)
    //const eventos = await getEventosCulturales();
  //  await ItemController.guardarEventos(eventos); // Guarda los eventos en la base de datos
    //console.log(`Total eventos obtenidos: ${eventos.length}`);
    //console.log(eventos); // Muestra los eventos en la consola
  } catch (error) {
    console.error('Error al obtener eventos culturales:', error.message);
  }
}

// Llama a la función de depuración después de configurar todo
debugEventosCulturales();

module.exports = app;
