const jwt = require('jsonwebtoken');

const socketAuthMiddleware = async (socket, next) => {
  const token = socket.handshake.headers['authorization']; 

  if (!token) {
    return next(new Error('Token de autenticación no proporcionado'));
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); 
    socket.user = decoded;
    return next();
  } catch (err) {
    return next(new Error('Token inválido o expirado'));
  }
};


module.exports = socketAuthMiddleware;
