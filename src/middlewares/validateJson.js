const { createBadRequestResponse } = require("../utils/utils");

module.exports = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    let rawData = '';

    req.on('data', chunk => {
      rawData += chunk;
    });

    req.on('end', () => {
      try {
        req.body = JSON.parse(rawData);
        next(); 
      } catch (e) {
        return createBadRequestResponse(res, "Invalid JSON format");
      }
    });
  } else {
    next();
  }
};
