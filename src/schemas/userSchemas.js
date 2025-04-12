const getUserByIdSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } // Validación de ObjectId
  },
  required: ['id'],
  additionalProperties: false
};

const getEventsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }, // Validación de ObjectId
    name: { type: 'string' },
    date: { type: 'string', format: 'date' },
    category: { type: 'string' },
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1 }
  },
  required: ['id'],
  additionalProperties: false
};

const updateUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }, // Validación de ObjectId
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', pattern: '^\\+?[0-9]{7,15}$' }
  },
  required: ['id'],
  additionalProperties: false
};

const saveEventSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }, // Validación de ObjectId
    eventId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } // Validación de ObjectId
  },
  required: ['id', 'eventId'],
  additionalProperties: false
};

const deleteEventSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }, // Validación de ObjectId
    eventId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } // Validación de ObjectId
  },
  required: ['id', 'eventId'],
  additionalProperties: false
};

const getUserCommentsSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } // Validación de ObjectId
  },
  required: ['id'],
  additionalProperties: false
};

module.exports = {
  getUserByIdSchema,
  getEventsSchema,
  updateUserSchema,
  saveEventSchema,
  deleteEventSchema,
  getUserCommentsSchema
};
