const createChatSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      additionalProperties: false
    },
    body: {
      type: 'object',
      properties: {
        user: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
      },
      required: ['user'], // <-- Esto es importante
      additionalProperties: false
    },
    query: {
      type: 'object',
      additionalProperties: false
    }
  },
  required: ['body'], // <-- Esto es importante
  additionalProperties: false
};

const getChatMessagesSchema = {
  type: 'object',
  properties: {
    params: {
      type: 'object',
      properties: {
        chatId: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' }
      },
      required: ['chatId'],
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
  required: ['params'], // <-- Esto es importante
  additionalProperties: false
};

module.exports = { createChatSchema, getChatMessagesSchema };