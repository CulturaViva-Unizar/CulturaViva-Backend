const passport = require('passport');
const env = require('./env.js');
const { UserGoogle, UserPassword, User } = require('../models/userModel.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../logger/logger.js');

const options = {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.BACKEND_URL + "/auth/google/callback"
};

passport.use(new GoogleStrategy(options, async (accessToken, refreshToken, profile, done) => {
    try {
        const emailObj = profile.emails?.[0];
        if (!emailObj || !profile._json?.email_verified) {
            return done(new Error('Email no verificado'), null);
        }
        const email = emailObj.value.toLowerCase();

        let user = await UserGoogle.findOne({ googleId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return done(Object.assign(new Error('Email conflict'), { status: 409 }), null);
            }

            const newUser = new UserGoogle({
                googleId: profile.id,
                name: profile.displayName,
                email: email,
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
