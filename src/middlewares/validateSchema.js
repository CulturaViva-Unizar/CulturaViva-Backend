const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { createBadRequestResponse } = require('../utils/utils');
const logger = require('../logger/logger.js');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validateSchema = (schema) => (req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type'] !== 'application/json') {
    logger.error('Invalid Content-Type', {
      contentType: req.headers['content-type'],
      requestData: {
        params: req.params,
        body: req.body,
        query: req.query
      }
    });
    return createBadRequestResponse(res, 'Invalid Content-Type. Expected application/json');
  }

  const validate = ajv.compile(schema);

  const requestData = {
    params: req.params,
    body: req.body,
    query: req.query
  };

  const valid = validate(requestData);

  if (!valid) {
    logger.error('Validation errors', {
      errors: validate.errors,
      requestData
    });
    return createBadRequestResponse(res, 'Invalid request data', validate.errors);
  }

  next();
};

module.exports = validateSchema;
