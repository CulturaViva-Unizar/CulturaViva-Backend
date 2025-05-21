# Documentación CulturaViva

## 1. URLs de acceso al API (Swagger) y al front-end del proyecto. 
- URL de acceso al API (Swagger): https://culturaviva-backend.onrender.com/api-docs/ (Desplegado en render)
- URL de acceso al front-end del proyecto: https://culturaviva-frontend.onrender.com/ (Desplegado en render)

## 2. Credenciales de acceso de usuario y administrador. 
Nota: Estos usuarios tienen un email falso, por lo que no recibirán notificaciones por E-mail. Si se desea probar un caso real, lo más recomendable es un registro mediante Google, GitHub o mediante usuario-contraseña.
### 2.1 Usuario común: 
- email: user@culturaviva.invalid
- contraseña: 3-kUO0O6PT4E
### 2.2 Administrador
- email: admin@culturaviva.invalid
- contraseña: noT-NtS0L184
## 3. Módulos utilizados para la implementación del back-end y breve descripción de cada uno. 
El módulo más importante que se ha utilizado para desarrollar el BackEnd es Express, que es un Framework completo para la creación de un servidor y el manejo de rutas. 
### 3.1 Dependencias principales

- **express**: Framework para Node.js que facilita la creación de servidores y manejo de rutas.
- **mongoose**: Object-Document Mapper para MongoDB que permite modelar datos con esquemas definidos.
- **jsonwebtoken**: Generación y validación de tokens JWT para autenticación basada en tokens.
- **passport**: Middleware de autenticación flexible con soporte para múltiples estrategias.
- **express-async-errors**: Permite manejar errores en funciones `async` sin bloques `try-catch`.
- **axios**: Cliente HTTP para realizar peticiones a otros servicios desde el backend.
- **node-cron**: Permite programar tareas recurrentes en intervalos definidos.
- **nodemailer**: Envío de correos electrónicos desde el servidor.
- **socket.io**: Comunicación en tiempo real (websockets), ideal para chats o notificaciones.
- **swagger-jsdoc**: Generación de documentación Swagger a partir de comentarios en el código.
- **swagger-ui-express**: Visualización interactiva de documentación Swagger en la web.
- **ajv**: Validador de esquemas JSON Schema.

### 3.2 Dependencias secundarias

- **passport-google-oauth20**: Estrategia de Passport para autenticación con Google.
- **passport-github2**: Estrategia de Passport para autenticación con GitHub.
- **passport-oauth2**: Estrategia base de OAuth2 para Passport.
- **passport-jwt**: Estrategia de Passport para autenticación basada en JWT.
- **passport-facebook**: Estrategia de Passport para autenticación con Facebook. No se llegó a terminar de implementar por política de Meta. 
- **@superfaceai/passport-twitter-oauth2**: Estrategia de Passport para autenticación con Twitter. No se llegó a terminar de implementar por ser una librería de comunidad con escasa documentación oficial.
- **dotenv**: Carga variables de entorno desde un archivo `.env`, útil para configuraciones sensibles.
- **bcrypt**: Encriptación de contraseñas para mayor seguridad.
- **crypto**: Módulo de Node.js para funciones criptográficas básicas.
- **ajv-formats**: Soporte adicional de formatos para `ajv`.
- **sanitize-html**: Sanitiza contenido HTML para evitar ataques XSS. Utilizado para limpiar etiquetas HTML del contenido de la API de Zaragoza. 

### 3.3 Dependencias de desarrollo / debug

- **jest**: Framework de pruebas para test unitarios y de integración.
- **supertest**: Librería para testear endpoints HTTP de forma automatizada junto con Jest.
- **prettier**: Herramienta de formateo de código para mantener un estilo consistente.
- **nodemon**: Reinicia automáticamente el servidor al detectar cambios en el código fuente durante el desarrollo.
- **winston**: Logger personalizable para registrar eventos del sistema.
- **winston-daily-rotate-file**: Extensión de Winston que permite rotar archivos de log por día.
- **cors**: Habilita el intercambio de recursos entre distintos orígenes (CORS).

## 4. Tecnología utilizada para el front-end. Módulos utilizados para su implementación y breve descripción de cada uno. 

######## TODO

## 5. Descripción de la validación y pruebas realizadas. 

## 6. Mejoras implementadas. 

## 7. Valoración global del proyecto (a realizar entre todo el equipo). 

## 8. Mejoras propuestas (si lo volviérais a hacer, cómo lo haríais? Qué mejoraríais?)