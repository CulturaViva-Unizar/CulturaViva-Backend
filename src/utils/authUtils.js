const env = require("../config/env");
const jwt = require("jsonwebtoken");

function createUserDto(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    admin: user.admin,
    type: user.userType,
  };
}


/**
 * Firma y devuelve un JWT para el usuario recibido.
 * @param {Object} user - Documento/módelo de usuario de Mongoose
 * @returns {String} token JWT
 */
function signJwt(user) {
  return jwt.sign(createUserDto(user), env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES,
  });
}

module.exports = { createUserDto, signJwt };
