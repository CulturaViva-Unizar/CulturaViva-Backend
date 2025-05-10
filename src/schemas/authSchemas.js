const registerSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        name: { type: 'string', minLength: 1 },
        phone: { type: 'string', pattern: '^\\+?[0-9]{7,15}$' }
      },
      required: ['email', 'password', 'name'],
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['body'],
  additionalProperties: false
};

const loginSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 }
      },
      required: ['email', 'password'],
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['body'],
  additionalProperties: false
};

const changePasswordSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string', minLength: 6 },
        newPassword: { type: 'string', minLength: 6 }
      },
      required: ['oldPassword', 'newPassword'],
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['body'],
  additionalProperties: false
};

module.exports = { registerSchema, loginSchema, changePasswordSchema };
