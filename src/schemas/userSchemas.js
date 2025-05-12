const getUserByIdSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          pattern: '^[a-fA-F0-9]{24}$'
        }
      },
      required: ['id'],
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['params'],
  additionalProperties: false
};

const getEventsSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } // Validación de ObjectId
      },
      required: ['id'],
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    },
    query: {
      type: 'object',
      properties: {
        page: { type: 'string', minimum: 1 },
        limit: { type: 'string', minimum: 1 },
        name: { type: 'string' },
        date: { type: 'string', format: 'date' },
        category: { type: 'string' }
      },
      additionalProperties: false
    }
  },
  required: ['params'],
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
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
      },
      required: ['id'],
      additionalProperties: false
    },
    body: {
      type: 'object',
      properties: {
        eventId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
      },
      required: ['eventId'],
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['params', 'body'],
  additionalProperties: false
};

const deleteEventSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
        eventId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
      },
      required: ['id', 'eventId'],
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['params'],
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
