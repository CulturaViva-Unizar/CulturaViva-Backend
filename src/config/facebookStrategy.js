const passport = require('passport');
const env = require('./env.js');
const { UserFacebook } = require('../models/userModel.js');
const FacebookStrategy = require('passport-facebook').Strategy;

const options = {
    clientID: env.FACEBOOK_APP_ID,
    clientSecret: env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email']
};


passport.use(new FacebookStrategy(options, async (accessToken, refreshToken, profile, done) => {
    
    try {
        var user = await UserFacebook.findOne({ facebookId: profile.id });
        if (user) {
            return done(null, user);
        } else {
            const newUser = new UserFacebook({
                facebookId: profile.id,
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
        console.error("Error en la estrategia de Facebook:", error);
        return done(error, null, { success: false, message: 'Error en la estrategia de Facebook' });
    }
}));


