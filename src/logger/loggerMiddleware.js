const logger = require('./logger');

function logRequests(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
      ip: req.ip,
      userId: req.userId ? req.userId : "unknown"
    });
  });

  next();
}

module.exports = logRequests;
