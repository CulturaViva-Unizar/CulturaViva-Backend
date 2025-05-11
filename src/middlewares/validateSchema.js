const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { createBadRequestResponse } = require('../utils/utils');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validateSchema = (schema) => (req, res, next) => {
  if (req.headers['content-type'] !== 'application/json') {
    return createBadRequestResponse(res, 'Content-Type must be application/json');  
  }

  const validate = ajv.compile(schema);

  const requestData = {
    params: req.params,
    body: req.body,
    query: req.query
  };

  const valid = validate(requestData);

  if (!valid) {
    console.log('Validation errors:', validate.errors);
    return createBadRequestResponse(res, 'Invalid request data', validate.errors);
  }

  next();
};

module.exports = validateSchema;
