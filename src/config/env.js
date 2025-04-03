require('dotenv').config();

const { env } = process;

const config = {
    DB_CONNECTION: env.DB_CONNECTION,
    JWT_SECRET: env.JWT_SECRET || 'secret',
    JWT_EXPIRES: env.JWT_EXPIRES || '1d',
};

module.exports = config;