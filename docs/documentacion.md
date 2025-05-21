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
## Pruebas unitarias back end
Se han realizado pruebas de todos los models y controllers utilizando la librería 'jest'. Las pruebas son exhaustivas y prueban tanto los casos donde todo va bien, como los casos de error. Si se ejecuta el comando 'npm test --coverage', se genera en la raíz del proyecto una carpeta coverage con el reporte de todos los tests, midiendo la covertura de tests. 

En cuanto a la API, se han realizado pruebas manuales de los endpoints utilizando Swagger. Se han probado de forma exhaustiva los casos de éxito y de error. 

Adicionalmente, se ha realizado un pequeño test end2end, que consiste en una colección de postman que prueba un flujo de un usuario ordinario. No se han desarrollado más por falta de tiempo, pero la API ha sido probada manualmente de forma exhaustiva. El fichero de colección de Postman y el entorno deben cargarse en Postman y ejecutar el test. 

## 6. Mejoras implementadas. 
## 6.1 DevOps (Utilización de herramientas de CI en el desarrollo):
En el back end se ha realizado una pipeline (.github/workflows/CI.yml) que hace que, tras cada push a la rama principal del repositorio (main) se ejecuten los tests. Si falla alguno de ellos, fallará el pipeline. 

Además, tanto en back end como en front end, si se despliega un tag (git tag vX.Y.Z, git push origin vX.Y.Z), el proyecto se despliega automáticamente en render. Esto, para el caso del back end, sucede únicamente si pasan todos los tests con éxito (etapa anterior del pipeline).

Adicionalmente, se han incluido badges en algunos proyectos. Para esto se ha integrado la organización con SonarQubeCloud. Hay un badge que es de GitHub y que mide si el pipeline CI.yaml está en estado 'passed' o si ha fallado. Se han incluido badges interesantes proporcionados por SonarQubeCloud, como el 'quality gate', 'bugs', 'code smells', 'duplicated lines (%)', 'lines of code', 'reliability', 'technical debt', 'maintainability' o 'vulnerabilities'. 

## 6.2 Utilización de analizadores de código (SonarQubeCloud)
Ambos proyectos se han integrado con SonarQubeCloud. Sus recomendaciones se han tenido en cuenta a lo largo del desarrollo, aunque al final no nos dio tiempo de arreglar muchas de ellas. Se incluyen badges en el Readme generados por SonarQubeCloud, como ya se ha comentado en la subsección anterior.

## 6.3 Login con al menos dos sistemas externos
Se permite login social con Google y con GitHub, además del tradicional usuario-contraseña. Se intentó realizar login social con Facebook y, de hecho, está implementado (aunque se eliminaron los endpoints), pero para que funcione hay que mandar papeleo a Facebook por lo que se descartó la opción. Se intentó realizar login social con Twitter/X, pero la librería utilizada debe estar deprecated y no la conseguimos hacer funcionar.

## 7. Valoración global del proyecto (a realizar entre todo el equipo). 

######## TODO

## 8. Mejoras propuestas (si lo volviérais a hacer, cómo lo haríais? Qué mejoraríais?)

######### TODO