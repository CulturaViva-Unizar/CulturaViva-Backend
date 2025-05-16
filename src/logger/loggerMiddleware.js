const logger = require('./logger');

function logRequests(req, res, next) {
  logger.info(`${req.method} ${req.url}`);
  next();
}

module.exports = logRequests;
