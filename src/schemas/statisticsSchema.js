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

const getUsersSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    },
    query: {
      type: 'object',
      properties: {
        type: { type: 'string' },
      },
      additionalProperties: false
    }
  },
  required: ['query'],
  additionalProperties: false
};

const getEventsCategorySchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    },
    query: {
      type: 'object',
      properties: {
        category: { type: 'string' }
      },
      additionalProperties: false
    }
  },
  required: ['query'],
  additionalProperties: false
};

const getVisitsSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      additionalProperties: false
    },
    query: {
      type: 'object',
      properties: {
        range: { 
          type: 'string',
          enum: ['1w', '1m', '3m', '6m', '9m', '12m']
        }
      },
      additionalProperties: false
    }
  },
  required: ['query'],
  additionalProperties: false
};

module.exports = { 
  getSchema, 
  getUsersSchema, 
  getEventsCategorySchema,
  getVisitsSchema
};