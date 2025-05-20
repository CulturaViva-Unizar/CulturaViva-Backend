require('dotenv').config();

const { env } = process;

const config = {
    DB_CONNECTION: env.DB_CONNECTION,
    JWT_SECRET: env.JWT_SECRET,
    JWT_EXPIRES: env.JWT_EXPIRES,
    PORT: env.PORT,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_APP_ID: env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: env.FACEBOOK_APP_SECRET,
    TWITTER_CLIENT_ID: env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: env.TWITTER_CLIENT_SECRET,
    BACKEND_URL: env.BACKEND_URL || "http://localhost:3000",
    FRONTEND_URL: env.FRONTEND_URL || "https://culturaviva-frontend.onrender.com",
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
};

module.exports = config;