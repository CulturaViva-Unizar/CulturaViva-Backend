const passport = require('passport');
const env = require('./env.js');
const { UserTwitter, User } = require('../models/userModel.js');
const TwitterStrategy = require('@superfaceai/passport-twitter-oauth2').Strategy;
const logger = require('../logger/logger.js');


const options = {
  clientType: 'confidential',
  clientID: env.TWITTER_CLIENT_ID,
  clientSecret: env.TWITTER_CLIENT_SECRET,
  callbackURL: env.BACKEND_URL + "/auth/twitter/callback"
};

console.log(options);

passport.use(new TwitterStrategy(options, async (accessToken, refreshToken, profile, done) => {
  console.log("Profile de Twitter", profile);
  try {
    logger.info('Info', {
      accessToken,
      refreshToken,
      profile
    });
    const emailObj = profile.emails?.[0];
    if (!emailObj || !profile._json?.email_verified) {
      return done(new Error('Email no verificado'), null);
    }
    const email = emailObj.value.toLowerCase();

    let user = await UserTwitter.findOne({ twitterId: profile.id });
    if (user) {
      console.log(profile)
      return done(null, user);
    } else {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return done(Object.assign(new Error('Email conflict'), { status: 409 }), null);
      }
      const newUser = new UserTwitter({
        twitterId: profile.id,
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
    logger.error("Error en la estrategia de Twitter:", error, {
      message: error.message,
      stack: error.stack,
    });
    return done(error, null, { success: false, message: 'Error en la estrategia de Google' });
  }
}));

console.log("Estrategias registradas en Passport:", Object.keys(passport._strategies));
