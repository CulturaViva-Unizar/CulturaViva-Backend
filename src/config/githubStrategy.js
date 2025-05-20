const passport = require('passport');
const env = require('./env.js');
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
    clientID: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    callbackURL: env.BACKEND_URL + "/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Profile de GitHub", profile);
      // Aquí haces tu lógica de usuario: buscar o crear en la BD
      const email = profile.emails?.[0]?.value?.toLowerCase();
      
      let user = await User.findOne({ githubId: profile.id });
      if (!user) {
        user = await User.create({
          githubId: profile.id,
          email,
          name: profile.displayName || profile.username,
          // otros campos que quieras guardar
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));
