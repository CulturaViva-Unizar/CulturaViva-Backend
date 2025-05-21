const { registerSchema, loginSchema, changePasswordSchema } = require('../../src/schemas/authSchemas');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

describe('Auth Schemas', () => {
  let ajv;

  beforeEach(() => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
  });

  describe('Register Schema', () => {
    it('should validate a valid register request', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: '+34600000000'
        }
      };
      const validate = ajv.compile(registerSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should validate a valid register request without phone', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }
      };
      const validate = ajv.compile(registerSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        body: {
          email: 'not-an-email',
          password: 'password123',
          name: 'Test User'
        }
      };
      const validate = ajv.compile(registerSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/email');
    });

    it('should reject password that is too short', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: '12345',
          name: 'Test User'
        }
      };
      const validate = ajv.compile(registerSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/password');
    });

    it('should reject empty name', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: ''
        }
      };
      const validate = ajv.compile(registerSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/name');
    });

    it('should reject invalid phone format', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          phone: 'not-a-phone'
        }
      };
      const validate = ajv.compile(registerSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/phone');
    });

    it('should reject additional properties', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(registerSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Login Schema', () => {
    it('should validate a valid login request', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      const validate = ajv.compile(loginSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        body: {
          email: 'not-an-email',
          password: 'password123'
        }
      };
      const validate = ajv.compile(loginSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/email');
    });

    it('should reject password that is too short', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: '12345'
        }
      };
      const validate = ajv.compile(loginSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/password');
    });

    it('should reject additional properties', () => {
      const data = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(loginSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Change Password Schema', () => {
    it('should validate a valid change password request', () => {
      const data = {
        body: {
          oldPassword: 'password123',
          newPassword: 'newPassword123'
        }
      };
      const validate = ajv.compile(changePasswordSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(true);
    });

    it('should reject old password that is too short', () => {
      const data = {
        body: {
          oldPassword: '12345',
          newPassword: 'newPassword123'
        }
      };
      const validate = ajv.compile(changePasswordSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/oldPassword');
    });

    it('should reject new password that is too short', () => {
      const data = {
        body: {
          oldPassword: 'password123',
          newPassword: '12345'
        }
      };
      const validate = ajv.compile(changePasswordSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
      expect(validate.errors[0].instancePath).toBe('/body/newPassword');
    });

    it('should reject additional properties', () => {
      const data = {
        body: {
          oldPassword: 'password123',
          newPassword: 'newPassword123',
          extraField: 'should not be here'
        }
      };
      const validate = ajv.compile(changePasswordSchema);
      const isValid = validate(data);
      
      expect(isValid).toBe(false);
    });
  });
});
