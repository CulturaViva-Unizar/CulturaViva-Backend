const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validateSchema = (schema) => (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) &&
      req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
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
    return res.status(400).json({ errors: validate.errors });
  }

  next();
};

module.exports = validateSchema;
