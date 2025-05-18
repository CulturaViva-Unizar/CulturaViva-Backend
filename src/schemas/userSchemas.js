const getSchema = {
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
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        itemType: { type: 'string' },
        category: { type: 'string' },
        sort: { type: 'string' },
        order: { type: 'string', enum: ['asc', 'desc'] }
      },
      additionalProperties: false
    }
  },
  required: ['params'],
  additionalProperties: false
};

const getRecommendedItemsSchema = {
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
        type: { type: 'string' },
        sort: { type: 'string' },
        order: { type: 'string', enum: ['asc', 'desc'] }
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
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' } // Validación de ObjectId
      },
      required: ['id'],
      additionalProperties: false
    },
    body:
    {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', pattern: '^\\+?[0-9]{7,15}$' },
        active: { type: 'boolean' },
        password: { type: 'string', minLength: 6 }
      },
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
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

const getUpcomingEventsSchema = {
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
    query: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, default: 16 }
      },
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['params'],
  additionalProperties: false
};

const deleteAttendingEventSchema = {
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
    query: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['params'],
  additionalProperties: false
};

module.exports = {
  getSchema,
  getEventsSchema,
  updateUserSchema,
  saveEventSchema,
  deleteEventSchema,
  getRecommendedItemsSchema,
  getUpcomingEventsSchema,
  deleteAttendingEventSchema
};
