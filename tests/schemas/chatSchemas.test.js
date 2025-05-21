const { createChatSchema, getChatMessagesSchema } = require('../../src/schemas/chatSchemas');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Chat Schemas', () => {
  let ajv;

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
  });

  describe('Create Chat Schema', () => {
    it('should validate a valid create chat request', () => {
      const data = {
        body: {
          user: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(createChatSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing user', () => {
      const data = {
        body: {}
      };
      const validate = ajv.compile(createChatSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('user');
    });

    it('should reject invalid user ID format', () => {
      const data = {
        body: {
          user: 'not-a-valid-id'
        }
      };
      const validate = ajv.compile(createChatSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/user');
    });

    it('should reject additional properties in body', () => {
      const data = {
        body: {
          user: '507f1f77bcf86cd799439011',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(createChatSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Get Chat Messages Schema', () => {
    it('should validate a valid get chat messages request', () => {
      const data = {
        params: {
          chatId: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(getChatMessagesSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing chatId', () => {
      const data = {
        params: {}
      };
      const validate = ajv.compile(getChatMessagesSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('chatId');
    });

    it('should reject invalid chatId format', () => {
      const data = {
        params: {
          chatId: 'not-a-valid-id'
        }
      };
      const validate = ajv.compile(getChatMessagesSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/params/chatId');
    });

    it('should reject additional properties in params', () => {
      const data = {
        params: {
          chatId: '507f1f77bcf86cd799439011',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(getChatMessagesSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });
});
