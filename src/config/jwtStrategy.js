const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models/userModel.js');
const logger = require('../logger/logger.js');

const env = require('./env.js');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.JWT_SECRET,
  algorithms: ['HS256'], 
  ignoreExpiration: false, 
  passReqToCallback: true,
};

passport.use(new JwtStrategy(options, async (req, jwt_payload, done) => {
  try {

    // Verificacion token
    if (!jwt_payload || !jwt_payload.id) {
      logger.warn('Intento de acceso con token no valido', {
        ip: req.ip
      });
      return done(null, false, { success: false, message: 'Invalid token structure' });
    }


    // Verificacion usuario
    const user = await User.findById(jwt_payload.id);
    if (!user) {
      logger.warn('Intento de acceso con usuario no encontrado', {
        userId: jwt_payload.id,
        ip: req.ip
      });
      return done(null, false, { success: false, message: 'User not found' });
    }

    // Verificacion baneo
    if (!user.active) {
      logger.warn('Intento de acceso con usuario inactivo', {
        userId: user._id,
        ip: req.ip
      });
      return done(null, false, { success: false, message: 'User account is deactivated' });
    }

    // Informacion del user para los siguientes middlewares
    req.userId = user._id;

    return done(null, true);
  } catch (error) {
    logger.error("Error in JWT strategy:", error, {
      message: error.message,
      stack: error.stack,
    });
    return done(error, false, { success: false, message: 'Authentication error occurred' });
  }
}));

module.exports = passport;