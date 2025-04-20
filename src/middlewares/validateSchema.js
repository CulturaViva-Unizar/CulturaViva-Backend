const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/** 
 * Middleware to validate request body against a JSON schema
 * Usage: app.post('/endpoint', validateSchema(schema), handler)
 */
const validateSchema = (schema) => (req, res, next) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }

  const validate = ajv.compile(schema);

  const dataToValidate = req.method === 'GET' ? req.params : req.body;
  const valid = validate(dataToValidate);
  if (!valid) {
    console.log('Validation errors:', validate.errors);
    return res.status(400).json({ errors: validate.errors });
  }
  console.log('Validation successful:', req.body);
  next();
};

module.exports = validateSchema;
