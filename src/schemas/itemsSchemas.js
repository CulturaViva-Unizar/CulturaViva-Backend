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

const createCommentSchema = {
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
      properties: {
        text: { type: 'string' },
        value: { type: 'number' },
      },
      required: ['text'],
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

const deleteCommentSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
        commentId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
      },
      required: ['id', 'commentId'],
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    },
    query: {
      type: 'object',
      properties: {
        motivo: { type: 'string' },
      },
      additionalProperties: false
    }
  },
  required: ['params'],
  additionalProperties: false
};

const createCommentResponseSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          pattern: '^[a-fA-F0-9]{24}$'
        }, 
        commentId: {
          type: 'string',
          pattern: '^[a-fA-F0-9]{24}$'
        }
      },
      required: ['id'],
      additionalProperties: false
    },
    body: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        responseTo: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
      },
      required: ['text'],
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['params', 'body'],
  additionalProperties: false
}



const getItemsSchema = {
  type: 'object',
  properties: {
    query: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' },
        category: { type: 'string' },
        minPrice: { type: 'number' },
        maxPrice: { type: 'number' },
        page: { type: 'string', minimum: 1, default: 1 },
        limit: { type: 'string', minimum: 1, default: 16 },
        sort: { type: 'string' },
        order: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }
      },
      additionalProperties: false
    },
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['query'],
  additionalProperties: false
};

module.exports = {
  getSchema, 
  createCommentSchema,
  deleteCommentSchema,
  createCommentResponseSchema,
  getItemsSchema
};