require('dotenv').config();

const { env } = process;

const config = {
    DB_CONNECTION: env.DB_CONNECTION,
    JWT_SECRET: env.JWT_SECRET || 'secret',
    JWT_EXPIRES: env.JWT_EXPIRES || '1d',
    PORT: env.PORT,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: env.FACEBOOK_CLIENT_SECRET,
};

module.exports = config;