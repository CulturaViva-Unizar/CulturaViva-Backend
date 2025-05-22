const passport = require('passport');
const env = require('./env.js');
const { UserFacebook, UserPassword, User } = require('../models/userModel.js');
const FacebookStrategy = require('passport-facebook').Strategy;
const logger = require('../logger/logger.js');

const options = {
    clientID: env.FACEBOOK_APP_ID,
    clientSecret: env.FACEBOOK_APP_SECRET,
    callbackURL: env.BACKEND_URL + "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email']
};


passport.use(new FacebookStrategy(options, async (accessToken, refreshToken, profile, done) => {

    try {
        const emailObj = profile.emails?.[0];
        if (!emailObj) {
            return done(
                new Error('Facebook no devolvió email (usuario sin email verificado)'),
                null,
            );
        }
        const email = emailObj.value.toLowerCase();

        var user = await UserFacebook.findOne({ facebookId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return done(Object.assign(new Error('Email conflict'), { status: 409 }), null);
            }

            const newUser = new UserFacebook({
                facebookId: profile.id,
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
        logger.error("Error en la estrategia de Facebook:", error, {
            message: error.message,
            stack: error.stack,
        });
        return done(error, null, { success: false, message: 'Error en la estrategia de Facebook' });
    }
}));


