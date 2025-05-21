// filepath: /workspaces/CulturaViva-Backend/tests/middlewares/validateSchema.test.js
const validateSchema = require('../../src/middlewares/validateSchema');
const { createBadRequestResponse } = require('../../src/utils/utils');
const logger = require('../../src/logger/logger.js');

jest.mock('../../src/utils/utils', () => ({
  createBadRequestResponse: jest.fn()
}));

jest.mock('../../src/logger/logger.js', () => ({
  error: jest.fn()
}));

describe('validateSchema middleware', () => {
  let req;
  let res;
  let next;
  let schema;
  let middleware;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      params: {},
      body: {},
      query: {}
    };
    
    res = {};
    next = jest.fn();
    
    // Schema simple para validar un objeto con un campo name obligatorio
    schema = {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' }
          },
          required: ['name']
        }
      }
    };
    
    middleware = validateSchema(schema);
  });
  
  it('debe pasar al siguiente middleware cuando los datos son válidos', () => {
    req.body = { name: 'Test User' };
    
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(createBadRequestResponse).not.toHaveBeenCalled();
  });
  
  it('debe responder con error cuando el Content-Type no es application/json en peticiones POST', () => {
    req.method = 'POST';
    req.headers['content-type'] = 'text/plain';
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    
    const result = middleware(req, res, next);
    
    expect(result).toBe('badRequestResponse');
    expect(createBadRequestResponse).toHaveBeenCalledWith(
      res,
      'Invalid Content-Type. Expected application/json'
    );
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Invalid Content-Type', expect.any(Object));
  });
  
  it('debe responder con error cuando el Content-Type no es application/json en peticiones PUT', () => {
    req.method = 'PUT';
    req.headers['content-type'] = 'text/plain';
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    
    const result = middleware(req, res, next);
    
    expect(result).toBe('badRequestResponse');
    expect(createBadRequestResponse).toHaveBeenCalledWith(
      res,
      'Invalid Content-Type. Expected application/json'
    );
    expect(next).not.toHaveBeenCalled();
  });
  
  it('no debe verificar el Content-Type para peticiones GET', () => {
    req.method = 'GET';
    req.headers['content-type'] = 'text/plain';
    // Añadir datos válidos para pasar la validación del schema
    req.body = { name: 'Test User' };
    
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(createBadRequestResponse).not.toHaveBeenCalled();
  });
  
  it('debe responder con error cuando los datos no cumplen con el schema', () => {
    req.body = {}; // Falta name obligatorio
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    
    const result = middleware(req, res, next);
    
    expect(result).toBe('badRequestResponse');
    expect(createBadRequestResponse).toHaveBeenCalledWith(
      res,
      'Invalid request data',
      expect.any(Array)
    );
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Validation errors', expect.any(Object));
  });
  
  it('debe validar parámetros de ruta (req.params)', () => {
    const paramsSchema = {
      type: 'object',
      properties: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' }
          },
          required: ['id']
        }
      }
    };
    
    const paramsMiddleware = validateSchema(paramsSchema);
    
    // Caso válido
    req.params = { id: '507f1f77bcf86cd799439011' };
    paramsMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    
    // Caso inválido
    next.mockClear();
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    req.params = { id: 'invalid-id' };
    
    const result = paramsMiddleware(req, res, next);
    expect(result).toBe('badRequestResponse');
    expect(next).not.toHaveBeenCalled();
  });
  
  it('debe validar parámetros de consulta (req.query)', () => {
    const querySchema = {
      type: 'object',
      properties: {
        query: {
          type: 'object',
          properties: {
            page: { type: 'string', pattern: '^[0-9]+$' }
          },
          required: ['page']
        }
      }
    };
    
    const queryMiddleware = validateSchema(querySchema);
    
    // Caso válido
    req.query = { page: '1' };
    queryMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    
    // Caso inválido
    next.mockClear();
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    req.query = { page: 'abc' };
    
    const result = queryMiddleware(req, res, next);
    expect(result).toBe('badRequestResponse');
    expect(next).not.toHaveBeenCalled();
  });
  
  it('debe validar formatos específicos con ajv-formats', () => {
    const formatSchema = {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            date: { type: 'string', format: 'date' }
          },
          required: ['email', 'date']
        }
      }
    };
    
    const formatMiddleware = validateSchema(formatSchema);
    
    // Caso válido
    req.body = { 
      email: 'test@example.com', 
      date: '2025-05-21' 
    };
    formatMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    
    // Caso inválido - email incorrecto
    next.mockClear();
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    req.body = { 
      email: 'not-an-email', 
      date: '2025-05-21' 
    };
    
    const result = formatMiddleware(req, res, next);
    expect(result).toBe('badRequestResponse');
    expect(next).not.toHaveBeenCalled();
  });
  
  it('debe manejar schemas complejos con múltiples niveles', () => {
    const complexSchema = {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: {
                  type: 'object',
                  properties: {
                    city: { type: 'string' },
                    zipCode: { type: 'string', pattern: '^[0-9]{5}$' }
                  },
                  required: ['city', 'zipCode']
                }
              },
              required: ['name', 'address']
            }
          },
          required: ['user']
        }
      }
    };
    
    const complexMiddleware = validateSchema(complexSchema);
    
    // Caso válido
    req.body = { 
      user: {
        name: 'Test User',
        address: {
          city: 'Zaragoza',
          zipCode: '50001'
        }
      }
    };
    
    complexMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    
    // Caso inválido - falta zipCode
    next.mockClear();
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    req.body = { 
      user: {
        name: 'Test User',
        address: {
          city: 'Zaragoza'
          // Falta zipCode
        }
      }
    };
    
    const result = complexMiddleware(req, res, next);
    expect(result).toBe('badRequestResponse');
    expect(next).not.toHaveBeenCalled();
  });
  
  it('debe validar arrays en el schema', () => {
    const arraySchema = {
      type: 'object',
      properties: {
        body: {
          type: 'object',
          properties: {
            tags: { 
              type: 'array',
              items: { type: 'string' },
              minItems: 1
            }
          },
          required: ['tags']
        }
      }
    };
    
    const arrayMiddleware = validateSchema(arraySchema);
    
    // Caso válido
    req.body = { 
      tags: ['cultura', 'evento', 'zaragoza']
    };
    
    arrayMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    
    // Caso inválido - array vacío
    next.mockClear();
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    req.body = { 
      tags: []
    };
    
    const result = arrayMiddleware(req, res, next);
    expect(result).toBe('badRequestResponse');
    expect(next).not.toHaveBeenCalled();
    
    // Caso inválido - tipos incorrectos en el array
    next.mockClear();
    req.body = { 
      tags: ['cultura', 123, 'zaragoza']
    };
    
    const result2 = arrayMiddleware(req, res, next);
    expect(result2).toBe('badRequestResponse');
    expect(next).not.toHaveBeenCalled();
  });
});
