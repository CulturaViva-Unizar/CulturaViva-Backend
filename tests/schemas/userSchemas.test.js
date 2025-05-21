const {
  getSchema,
  getEventsSchema,
  updateUserSchema,
  saveEventSchema,
  deleteEventSchema,
  getRecommendedItemsSchema,
  getUpcomingEventsSchema,
  deleteAttendingEventSchema
} = require('../../src/schemas/userSchemas');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('User Schemas', () => {
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
    });
  });

  describe('Get Events Schema', () => {
    it('should validate a valid get events request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        query: {
          page: '1',
          limit: '10',
          name: 'Concert',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          itemType: 'event',
          category: 'music',
          sort: 'date',
          order: 'asc'
        }
      };
      const validate = ajv.compile(getEventsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate with minimal query parameters', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(getEventsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid order value', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        query: {
          order: 'invalid'
        }
      };
      const validate = ajv.compile(getEventsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/query/order');
    });
  });

  describe('Get Recommended Items Schema', () => {
    it('should validate a valid request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        query: {
          page: '1',
          limit: '10',
          type: 'event',
          sort: 'date',
          order: 'asc'
        }
      };
      const validate = ajv.compile(getRecommendedItemsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid order value', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        query: {
          order: 'invalid'
        }
      };
      const validate = ajv.compile(getRecommendedItemsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/query/order');
    });
  });

  describe('Update User Schema', () => {
    it('should validate a valid update request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+34600000000',
          active: true,
          password: 'newPassword123'
        }
      };
      const validate = ajv.compile(updateUserSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate with partial body', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          name: 'John Doe'
        }
      };
      const validate = ajv.compile(updateUserSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          email: 'not-an-email'
        }
      };
      const validate = ajv.compile(updateUserSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/email');
    });

    it('should reject invalid phone format', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          phone: 'not-a-phone'
        }
      };
      const validate = ajv.compile(updateUserSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/phone');
    });
  });

  describe('Save Event Schema', () => {
    it('should validate a valid save event request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {
          eventId: '507f1f77bcf86cd799439022'
        }
      };
      const validate = ajv.compile(saveEventSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing eventId', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        body: {}
      };
      const validate = ajv.compile(saveEventSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Delete Event Schema', () => {
    it('should validate a valid delete event request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011',
          eventId: '507f1f77bcf86cd799439022'
        }
      };
      const validate = ajv.compile(deleteEventSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing eventId', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(deleteEventSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Get Upcoming Events Schema', () => {
    it('should validate a valid upcoming events request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        },
        query: {
          category: 'music',
          page: '1',
          limit: '10'
        }
      };
      const validate = ajv.compile(getUpcomingEventsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate with minimal params', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(getUpcomingEventsSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Delete Attending Event Schema', () => {
    it('should validate a valid delete attending event request', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011',
          eventId: '507f1f77bcf86cd799439022'
        }
      };
      const validate = ajv.compile(deleteAttendingEventSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject missing eventId', () => {
      const data = {
        params: {
          id: '507f1f77bcf86cd799439011'
        }
      };
      const validate = ajv.compile(deleteAttendingEventSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });
});
