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
};

module.exports = config;