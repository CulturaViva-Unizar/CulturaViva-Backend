const passport = require('passport');
const env = require('./env.js');

var GoogleStrategy = require('passport-google-oauth20').Strategy;


const options = {
    ignoreExpiration: false, 
    passReqToCallback: true,
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/callback"
};

passport.use(new GoogleStrategy({options}, async (accessToken, refreshToken, profile, done) => {
    try {
        var user = await UserModel.findById(jwt_payload.id)
        if (user) {
            req.userId = user._id;
            return done(null, true);
        } else {
            const newUser = new UserModel({
                _id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                phone: profile.phone || '',
                admin: false,
                active: true
            });
            user = await newUser.save();
            req.userId = user._id;
            return done(null, true);
        }
    } catch (error) {
        console.error("Error en la estrategia de Google:", error);
        return done(error, null);
    }
}));

