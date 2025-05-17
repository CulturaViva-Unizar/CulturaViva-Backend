const passport = require('passport');
const env = require('./env.js');
const { UserGoogle } = require('../models/userModel.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../logger/logger.js');

const options = {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
};


passport.use(new GoogleStrategy(options, async (accessToken, refreshToken, profile, done) => {

    
    try {
        var user = await UserGoogle.findOne({ googleId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            const newUser = new UserGoogle({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                phone: profile.phone || '00',
                admin: false,
                active: true
            });
            user = await newUser.save();
            return done(null, user);
        }
    } catch (error) {
        logger.error("Error en la estrategia de Google:", error, {
            message: error.message,
            stack: error.stack,
        });
        return done(error, null, { success: false, message: 'Error en la estrategia de Google' });
    }
}));


