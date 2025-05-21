const { 
  getSchema, 
  createCommentSchema, 
  deleteCommentSchema, 
  createCommentResponseSchema, 
  getItemsSchema 
} = require('../../src/schemas/itemsSchemas');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Items Schemas', () => {
  let ajv;

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
  });

  describe('Get Schema', () => {
    it('should validate a valid get request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(getSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid id format', () => {
      const data = {
        params: {
          id: 'invalid-id'
        }
      };
      const validate = ajv.compile(getSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/params/id');
    });
  });

  describe('Create Comment Schema', () => {
    it('should validate a valid comment creation with text only', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          text: 'This is a test comment'
        }
      };
      const validate = ajv.compile(createCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate a valid comment creation with text and value', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          text: 'This is a test comment',
          value: 5
        }
      };
      const validate = ajv.compile(createCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing text', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          value: 5
        }
      };
      const validate = ajv.compile(createCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('text');
    });

    it('should reject additional properties in body', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          text: 'This is a test comment',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(createCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Delete Comment Schema', () => {
    it('should validate a valid comment deletion request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011',
          commentId: '507f1f77bcf86cd799439022'
        }
      };
      const validate = ajv.compile(deleteCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate with motivo query parameter', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011',
          commentId: '507f1f77bcf86cd799439022'
        },
        query: {
          motivo: 'spam'
        }
      };
      const validate = ajv.compile(deleteCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing id', () => {
      const data = {
        params: {
          commentId: '507f1f77bcf86cd799439022'
        }
      };
      const validate = ajv.compile(deleteCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('id');
    });

    it('should reject missing commentId', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(deleteCommentSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('commentId');
    });
  });

  describe('Create Comment Response Schema', () => {
    it('should validate a valid comment response creation', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011',
          commentId: '507f1f77bcf86cd799439022'
        },
        body: {
          text: 'This is a response to the comment',
          responseTo: '507f1f77bcf86cd799439033'
        }
      };
      const validate = ajv.compile(createCommentResponseSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate without responseTo', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011',
          commentId: '507f1f77bcf86cd799439022'
        },
        body: {
          text: 'This is a response to the comment'
        }
      };
      const validate = ajv.compile(createCommentResponseSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing text', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011',
          commentId: '507f1f77bcf86cd799439022'
        },
        body: {
          responseTo: '507f1f77bcf86cd799439033'
        }
      };
      const validate = ajv.compile(createCommentResponseSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('text');
    });
  });

  describe('Get Items Schema', () => {
    it('should validate a valid get items request with all parameters', () => {
      const data = {
        query: {
          name: 'Concert',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          category: 'music',
          minPrice: '10',
          maxPrice: '100',
          page: '1',
          limit: '20',
          sort: 'date',
          order: 'asc'
        }
      };
      const validate = ajv.compile(getItemsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate a minimal get items request', () => {
      const data = {
        query: {}
      };
      const validate = ajv.compile(getItemsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid date format', () => {
      const data = {
        query: {
          startDate: 'not-a-date'
        }
      };
      const validate = ajv.compile(getItemsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/query/startDate');
    });

    it('should reject invalid order value', () => {
      const data = {
        query: {
          order: 'invalid'
        }
      };
      const validate = ajv.compile(getItemsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/query/order');
    });
  });
});
