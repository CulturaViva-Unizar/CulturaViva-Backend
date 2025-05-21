const mongoose = require('mongoose');
const crypto = require('crypto');
const {
  toObjectId,
  generateOID,
  escapeRegExp,
  createResponse,
  createOkResponse,
  createCreatedResponse,
  createBadRequestResponse,
  createUnauthorizedResponse,
  createNotFoundResponse,
  createForbiddenResponse,
  createConflictResponse, 
  createInternalServerErrorResponse,
  cleanHtmltags,
  handlePagination
} = require('../../src/utils/utils');

jest.mock('crypto');

describe('Utils', () => {
  describe('toObjectId', () => {
    it('debe devolver el mismo ObjectId si se proporciona un ObjectId existente', () => {
      
      const validObjectId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
      
      
      const result = toObjectId(validObjectId);
      
      
      expect(result).toBe(validObjectId);
    });
    
    it('debe convertir un string válido en ObjectId', () => {
      
      const validObjectIdString = '507f1f77bcf86cd799439011';
      
      
      const result = toObjectId(validObjectIdString);
      
      
      expect(result).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(result.toString()).toBe(validObjectIdString);
    });
    
    it('debe lanzar un error si se proporciona un valor inválido', () => {
      
      const invalidId = '123';
      
      expect(() => {
        toObjectId(invalidId);
      }).toThrow('Invalid ObjectId');
    });
  });
  
  describe('generateOID', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    it('debe generar un ObjectId basado en un MD5 hash', () => {
      
      const apiId = 'test-api-id';
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('0123456789abcdef0123456789abcdef')
      };
      crypto.createHash.mockReturnValue(mockHash);
      
      
      const result = generateOID(apiId);
      
      
      expect(crypto.createHash).toHaveBeenCalledWith('md5');
      expect(mockHash.update).toHaveBeenCalledWith(apiId);
      expect(mockHash.digest).toHaveBeenCalledWith('hex');
      expect(result).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(result.toString()).toBe('0123456789abcdef01234567');
    });
  });
  
  describe('escapeRegExp', () => {
    it('debe escapar caracteres especiales de RegExp', () => {
      
      const input = 'text with special chars: . * + ? ^ $ { } ( ) | [ ] \\';
      
      
      const result = escapeRegExp(input);
      
      
      expect(result).toBe('text with special chars: \\. \\* \\+ \\? \\^ \\$ \\{ \\} \\( \\) \\| \\[ \\] \\\\');
    });
    
    it('debe manejar una cadena vacía', () => {
      
      const result = escapeRegExp();
      
      
      expect(result).toBe('');
    });
    
    it('debe manejar cadenas sin caracteres especiales', () => {
      
      const input = 'normal text without special chars';
      
      
      const result = escapeRegExp(input);
      
      
      expect(result).toBe(input);
    });
  });
  
  describe('funciones de respuestas HTTP', () => {
    let mockRes;
    
    beforeEach(() => {
      // Mock para res.status().json()
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });
    
    it('createResponse debe formatear correctamente la respuesta', () => {
      
      const status = 200;
      const message = 'Success message';
      const body = { key: 'value' };
      
      
      createResponse(mockRes, status, message, body);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(status);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: body
      });
    });
    
    it('createResponse debe establecer success=false para códigos de error', () => {
      
      const status = 400;
      const message = 'Error message';
      
      
      createResponse(mockRes, status, message);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(status);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        data: null
      });
    });
    
    it('createOkResponse debe usar el código 200', () => {
      
      const message = 'OK message';
      const body = { key: 'value' };
      
      
      createOkResponse(mockRes, message, body);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: body
      });
    });
    
    it('createCreatedResponse debe usar el código 201', () => {
      
      const message = 'Created message';
      const body = { id: '123' };
      
      
      createCreatedResponse(mockRes, message, body);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: body
      });
    });
    
    it('createBadRequestResponse debe usar el código 400', () => {
      
      const message = 'Bad request message';
      
      
      createBadRequestResponse(mockRes, message);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        data: null
      });
    });
    
    it('createUnauthorizedResponse debe usar el código 401', () => {
      
      const message = 'Unauthorized message';
      
      
      createUnauthorizedResponse(mockRes, message);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        data: null
      });
    });
    
    it('createNotFoundResponse debe usar el código 404', () => {
      
      const message = 'Not found message';
      
      
      createNotFoundResponse(mockRes, message);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        data: null
      });
    });
    
    it('createForbiddenResponse debe usar el código 403', () => {
      
      const message = 'Forbidden message';
      
      
      createForbiddenResponse(mockRes, message);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        data: null
      });
    });
    
    it('createConflictResponse debe usar el código 409', () => {
      
      const message = 'Conflict message';
      
      
      createConflictResponse(mockRes, message);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        data: null
      });
    });
    
    it('createInternalServerErrorResponse debe usar el código 500', () => {
      
      const message = 'Server error message';
      
      
      createInternalServerErrorResponse(mockRes, message);
      
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        data: null
      });
    });
  });
  
  describe('cleanHtmltags', () => {
    it('debe eliminar todas las etiquetas HTML del texto', () => {
      
      const dirtyText = '<p>Esto es un <strong>texto</strong> con <script>alert("malicioso")</script> etiquetas.</p>';
      
      
      const result = cleanHtmltags(dirtyText);
      
      
      expect(result).toBe('Esto es un texto con  etiquetas.');
    });
    
    it('debe conservar el texto sin etiquetas', () => {
      
      const plainText = 'Esto es solo texto sin etiquetas';
      
      
      const result = cleanHtmltags(plainText);
      
      
      expect(result).toBe(plainText);
    });
  });
  
  describe('handlePagination', () => {
    it('debe generar una pipeline de agregación básica con valores predeterminados', () => {
      
      const page = undefined;
      const limit = undefined;
      const query = { category: 'test' };
      
      
      const pipeline = handlePagination(page, limit, query);
      
      
      expect(pipeline).toHaveLength(5);
      expect(pipeline[0].$match).toEqual(query);
      expect(pipeline[1].$skip).toBe(0);  // (page 1 - 1) * limit 10 = 0
      expect(pipeline[2].$limit).toBe(10);
      expect(pipeline[3].$addFields).toEqual({ id: "$_id" });
      expect(pipeline[4].$project).toEqual({ _id: 0 });
    });
    
    it('debe aplicar los parámetros de paginación proporcionados', () => {
      
      const page = 3;
      const limit = 25;
      const query = { status: 'active' };
      
      
      const pipeline = handlePagination(page, limit, query);
      
      
      expect(pipeline[1].$skip).toBe(50);  // (page 3 - 1) * limit 25 = 50
      expect(pipeline[2].$limit).toBe(25);
    });
    
    it('debe aplicar el ordenamiento si se proporciona', () => {
      
      const page = 1;
      const limit = 10;
      const query = {};
      const orderCondition = { createdAt: -1 };
      
      
      const pipeline = handlePagination(page, limit, query, orderCondition);
      
      
      expect(pipeline[1].$sort).toEqual({ createdAt: -1, _id: 1 });
    });
    
    it('debe respetar el ordenamiento de _id si ya está especificado', () => {
      
      const orderCondition = { createdAt: -1, _id: -1 };
      
      
      const pipeline = handlePagination(1, 10, {}, orderCondition);
      
      
      expect(pipeline[1].$sort).toEqual({ createdAt: -1, _id: -1 });
    });
    
    it('debe aplicar condiciones de selección si se proporcionan', () => {
      
      const selectCondition = { name: 1, email: 1 };
      
      
      const pipeline = handlePagination(1, 10, {}, {}, selectCondition);
      
      
      expect(pipeline[5].$project).toEqual(selectCondition);
    });
    
    it('debe gestionar valores de página inválidos', () => {
      
      const page = 'abc';  // inválido, debería usar 1
      const limit = 10;
      
      
      const pipeline = handlePagination(page, limit, {});
      
      
      expect(pipeline[1].$skip).toBe(0);  // (default page 1 - 1) * 10 = 0
    });
    
    it('debe gestionar valores de límite inválidos', () => {
      
      const page = 2;
      const limit = 'xyz';  // inválido, debería usar 10
      
      
      const pipeline = handlePagination(page, limit, {});
      
      
      expect(pipeline[1].$skip).toBe(10);  // (page 2 - 1) * default 10 = 10
      expect(pipeline[2].$limit).toBe(10);  // default
    });
  });
});