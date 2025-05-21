const { 
  getSchema, 
  getUsersSchema, 
  getEventsCategorySchema,
  getVisitsSchema 
} = require('../../src/schemas/statisticsSchema');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Statistics Schemas', () => {
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

    it('should reject missing id', () => {
      const data = {
        params: {}
      };
      const validate = ajv.compile(getSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('id');
    });
  });

  describe('Get Users Schema', () => {
    it('should validate a valid get users request', () => {
      const data = {
        query: {
          type: 'active'
        }
      };
      const validate = ajv.compile(getUsersSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate with empty type', () => {
      const data = {
        query: {
          type: ''
        }
      };
      const validate = ajv.compile(getUsersSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing query', () => {
      const data = {};
      const validate = ajv.compile(getUsersSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('query');
    });

    it('should reject additional properties in query', () => {
      const data = {
        query: {
          type: 'active',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(getUsersSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Get Events Category Schema', () => {
    it('should validate a valid get events category request', () => {
      const data = {
        query: {
          category: 'music'
        }
      };
      const validate = ajv.compile(getEventsCategorySchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate with empty category', () => {
      const data = {
        query: {
          category: ''
        }
      };
      const validate = ajv.compile(getEventsCategorySchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate with no category specified', () => {
      const data = {
        query: {}
      };
      const validate = ajv.compile(getEventsCategorySchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing query', () => {
      const data = {};
      const validate = ajv.compile(getEventsCategorySchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('query');
    });

    it('should reject additional properties in query', () => {
      const data = {
        query: {
          category: 'music',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(getEventsCategorySchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Get Visits Schema', () => {
    it('should validate a valid get visits request', () => {
      const data = {
        query: {
          range: '1w'
        }
      };
      const validate = ajv.compile(getVisitsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate all valid range values', () => {
      const ranges = ['1w', '1m', '3m', '6m', '9m', '12m'];
      
      ranges.forEach(range => {
        const data = {
          query: { range }
        };
        const validate = ajv.compile(getVisitsSchema);
        const isValid = validate(data);
        
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid range value', () => {
      const data = {
        query: {
          range: 'invalid'
        }
      };
      const validate = ajv.compile(getVisitsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/query/range');
    });

    it('should reject missing query', () => {
      const data = {};
      const validate = ajv.compile(getVisitsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].params.missingProperty).toBe('query');
    });
  });
});
