const jwt = require('jsonwebtoken');
const { createUserDto, signJwt } = require('../../src/utils/authUtils');
const env = require('../../src/config/env');

// Mock de jwt
jest.mock('jsonwebtoken');

describe('AuthUtils', () => {
  describe('createUserDto', () => {
    it('debe crear un DTO correctamente a partir de un objeto de usuario', () => {
      
      const mockUser = {
        _id: 'user123',
        email: 'user@test.com',
        name: 'Test User',
        admin: true,
        userType: 'REGULAR',
        // Propiedades adicionales que no deberían estar en el DTO
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      
      const result = createUserDto(mockUser);

      
      expect(result).toEqual({
        id: 'user123',
        email: 'user@test.com',
        name: 'Test User',
        admin: true,
        type: 'REGULAR'
      });
      // Verificamos que solo se incluyen las propiedades definidas
      expect(Object.keys(result)).toHaveLength(5);
      expect(result.password).toBeUndefined();
      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it('debe manejar un usuario con valores vacíos o undefined', () => {
      
      const mockUser = {
        _id: 'user456',
        email: '',
        name: undefined,
        // Sin admin ni userType
      };

      
      const result = createUserDto(mockUser);

      
      expect(result).toEqual({
        id: 'user456',
        email: '',
        name: undefined,
        admin: undefined,
        type: undefined
      });
    });
  });

  describe('signJwt', () => {
    beforeEach(() => {
      // Clear mocks before each test
      jest.clearAllMocks();
    });

    it('debe firmar un JWT con el DTO del usuario y las configuraciones correctas', () => {
      
      const mockUser = {
        _id: 'user789',
        email: 'another@test.com',
        name: 'Another User',
        admin: false,
        userType: 'ADMIN'
      };
      
      const expectedUserDto = {
        id: 'user789',
        email: 'another@test.com',
        name: 'Another User',
        admin: false,
        type: 'ADMIN'
      };

      const mockToken = 'jwt.mock.token';
      jwt.sign.mockReturnValue(mockToken);

      
      const result = signJwt(mockUser);

      
      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        expectedUserDto,
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES }
      );
    });

    it('debe usar el secreto JWT y tiempo de expiración de las variables de entorno', () => {
      
      const mockUser = {
        _id: 'user101',
        email: 'test@jwt.com',
        name: 'JWT Test',
        admin: true,
        userType: 'REGULAR'
      };
      
      const mockToken = 'another.mock.token';
      jwt.sign.mockReturnValue(mockToken);

      
      const result = signJwt(mockUser);

      
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES }
      );
    });
  });
});