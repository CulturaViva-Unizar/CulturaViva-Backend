const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const UserModel = require('../models/userModel.js');
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
            return done(null, false, { message: 'Invalid token structure' });
        }

        // Verificacion usuario
        const user = await UserModel.findById(jwt_payload.id)
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }

        // Verificacion baneo
        if (!user.active) {
            return done(null, false, { message: 'User account is deactivated' });
        }

        // Informacion del user para los siguientes middlewares
        req.userId = user._id;

        return done(null, true);
    } catch (error) {
        return done(error, false, { message: 'Authentication error occurred' });
    }
}));

module.exports = passport;