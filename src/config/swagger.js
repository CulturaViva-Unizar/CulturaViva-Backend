// Opciones de configuración para Swagger
const path = require("path");

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "API Documentación",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          }
        }
      },
    },
    apis: [path.join(__dirname, "../routes/*.js"), path.join(__dirname, "../routes/schemas/*.yaml"), path.join(__dirname, "../models/*.js")],
};

module.exports = options;
