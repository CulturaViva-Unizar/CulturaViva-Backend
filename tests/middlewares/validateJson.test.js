// filepath: /workspaces/CulturaViva-Backend/tests/middlewares/validateJson.test.js
const validateJson = require('../../src/middlewares/validateJson');
const { createBadRequestResponse } = require('../../src/utils/utils');

jest.mock('../../src/utils/utils', () => ({
  createBadRequestResponse: jest.fn()
}));

describe('validateJson middleware', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Limpia los mocks entre tests
    jest.clearAllMocks();
    
    // Mock de request con eventos simulados
    req = {
      method: 'POST',
      body: {},
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          req.dataCallback = callback;
        } else if (event === 'end') {
          req.endCallback = callback;
        }
      })
    };
    
    // Mock de response
    res = {};
    
    // Mock de next
    next = jest.fn();
  });
  
  it('debe parsear correctamente un JSON válido y llamar a next()', () => {
    const validJson = '{"name":"test","age":25}';
    
    validateJson(req, res, next);
    
    // Simula el evento 'data'
    req.dataCallback(validJson);
    
    // Simula el evento 'end'
    req.endCallback();
    
    expect(req.body).toEqual({ name: 'test', age: 25 });
    expect(next).toHaveBeenCalled();
    expect(createBadRequestResponse).not.toHaveBeenCalled();
  });
  
  it('debe manejar JSON enviado en múltiples chunks', () => {
    const jsonPart1 = '{"name":"te';
    const jsonPart2 = 'st","age":';
    const jsonPart3 = '25}';
    
    validateJson(req, res, next);
    
    // Simula el evento 'data' para cada chunk
    req.dataCallback(jsonPart1);
    req.dataCallback(jsonPart2);
    req.dataCallback(jsonPart3);
    
    // Simula el evento 'end'
    req.endCallback();
    
    expect(req.body).toEqual({ name: 'test', age: 25 });
    expect(next).toHaveBeenCalled();
    expect(createBadRequestResponse).not.toHaveBeenCalled();
  });
  
  it('debe responder con error 400 cuando el JSON es inválido', () => {
    const invalidJson = '{"name":"test", "age":}'; // JSON inválido
    createBadRequestResponse.mockReturnValue('badRequestResponse');
    
    validateJson(req, res, next);
    
    // Simula el evento 'data'
    req.dataCallback(invalidJson);
    
    // Simula el evento 'end'
    req.endCallback();
    
    expect(createBadRequestResponse).toHaveBeenCalledWith(res, "Invalid JSON format");
    expect(next).not.toHaveBeenCalled();
  });
  
  it('debe llamar directamente a next() para métodos que no son POST ni PUT', () => {
    req.method = 'GET';
    
    validateJson(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.on).not.toHaveBeenCalled();
  });
  
  it('debe manejar correctamente un método PUT', () => {
    req.method = 'PUT';
    const validJson = '{"name":"updated","age":30}';
    
    validateJson(req, res, next);
    
    // Simula el evento 'data'
    req.dataCallback(validJson);
    
    // Simula el evento 'end'
    req.endCallback();
    
    expect(req.body).toEqual({ name: 'updated', age: 30 });
    expect(next).toHaveBeenCalled();
    expect(createBadRequestResponse).not.toHaveBeenCalled();
  });
  
  it('debe manejar correctamente un JSON vacío', () => {
    const emptyJson = '{}';
    
    validateJson(req, res, next);
    
    // Simula el evento 'data'
    req.dataCallback(emptyJson);
    
    // Simula el evento 'end'
    req.endCallback();
    
    expect(req.body).toEqual({});
    expect(next).toHaveBeenCalled();
    expect(createBadRequestResponse).not.toHaveBeenCalled();
  });
  
  it('debe manejar correctamente un array JSON', () => {
    const arrayJson = '[1,2,3,4]';
    
    validateJson(req, res, next);
    
    // Simula el evento 'data'
    req.dataCallback(arrayJson);
    
    // Simula el evento 'end'
    req.endCallback();
    
    expect(req.body).toEqual([1, 2, 3, 4]);
    expect(next).toHaveBeenCalled();
    expect(createBadRequestResponse).not.toHaveBeenCalled();
  });
});
