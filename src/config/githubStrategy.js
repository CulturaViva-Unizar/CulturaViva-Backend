const passport = require('passport');
const env = require('./env.js');
const { UserGithub, UserPassword, User } = require('../models/userModel.js');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');

passport.use(new GitHubStrategy({
    clientID: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    callbackURL: env.BACKEND_URL + "/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Profile de GitHub", profile);

      let emailObj = profile.emails?.[0];

      // Si no hay email en el perfil, pedirlo a la API de GitHub
      if (!emailObj) {
        const emailsRes = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${accessToken}` }
        });
        // Busca el email principal y verificado
        const primaryEmail = emailsRes.data.find(e => e.primary && e.verified);
        if (primaryEmail) {
          emailObj = { value: primaryEmail.email };
        }
      }

      if (!emailObj) {
        return done(new Error('No se pudo obtener el email de GitHub'), null);
      }
      const email = emailObj.value.toLowerCase();

      let user = await UserGithub.findOne({ githubId: profile.id });
      if (user) {
        return done(null, user);
      } else {
        // Comprobar conflicto de email con User
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
          return done(Object.assign(new Error('Email conflict'), { status: 409 }), null);
        }
        const newUser = new UserGithub({
          githubId: profile.id,
          email: email,
          name: profile.displayName || profile.username,
          admin: false,
          active: true,
          phone: '00' // github no proporciona un número de teléfono
        });
        user = await newUser.save();
        return done(null, user);
      }
    } catch (error) {
      return done(error, null, { success: false, message: 'Error en la estrategia de GitHub' });
    }
  }
));