const { UserPassword } = require('../../src/models/userModel.js');
const authController = require('../../src/controllers/authController.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
  describe('login', () => {
    it('Debería loguear correctamente con credenciales válidas', async () => {
      const req = {
        body: {
          email: 'test@test.com',
          password: 'password123'
        },
        ip: '127.0.0.1'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      const user = {
        _id: 'user-id',
        email: 'test@test.com',
        password: 'hashedPassword',
        name: 'Test User',
        admin: false,
        active: true
      };

      UserPassword.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      await authController.login(req, res, next);

      expect(UserPassword.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, user.password);
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });

    it('Debería fallar si el usuario no existe', async () => {
      const req = {
        body: {
          email: 'inexistente@test.com',
          password: 'password123'
        },
        ip: '127.0.0.1'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      UserPassword.findOne.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        data: null,
        success: false,
        message: 'Credenciales incorrectas'
      });
    });

    it('Debería fallar si el usuario está inactivo', async () => {
      const req = {
        body: {
          email: 'inactivo@test.com',
          password: 'password123'
        },
        ip: '127.0.0.1'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      UserPassword.findOne.mockResolvedValue({
        email: 'inactivo@test.com',
        password: 'hashed',
        active: false
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        data: null,
        success: false,
        message: 'Credenciales incorrectas'
      });
    });

    it('Debería fallar si la contraseña no coincide', async () => {
      const req = {
        body: {
          email: 'test@test.com',
          password: 'wrongpass'
        },
        ip: '127.0.0.1'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        email: 'test@test.com',
        password: 'hashedPassword',
        active: true
      };

      UserPassword.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        data: null,
        success: false,
        message: 'Credenciales incorrectas'
      });
    });
  });

  describe('changePassword', () => {
    it('Debería cambiar la contraseña si la anterior es correcta', async () => {
      const req = {
        body: {
          oldPassword: 'oldpass',
          newPassword: 'newpass'
        },
        userId: 'user-id'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        _id: 'user-id',
        password: 'hashedOldPass',
        save: jest.fn()
      };

      UserPassword.findById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashedNewPass');

      await authController.changePassword(req, res);

      expect(user.password).toBe('hashedNewPass');
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: null
      });
    });

    it('Debería fallar si la contraseña anterior es incorrecta', async () => {
      const req = {
        body: {
          oldPassword: 'wrongpass',
          newPassword: 'newpass'
        },
        userId: 'user-id'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const user = {
        password: 'hashedOldPass'
      };

      UserPassword.findById.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await authController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contraseña incorrecta',
        data: null
      });
    });
  });

  describe('generateToken', () => {
    it('Debería generar un token JWT válido', async () => {
      const req = {
        user: {
          _id: '123',
          email: 'test@test.com',
          name: 'Test User',
          admin: false,
          userType: 'normal'
        }
      };

      const res = {
        statusCode: 200,
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const token = 'mocked-jwt-token';
      jwt.sign.mockReturnValue(token);

      await authController.generateToken(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token generado exitosamente',
        data: {
          user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            admin: req.user.admin,
            type: req.user.userType
          },
          accessToken: token
        }
      });
    });
  });
});
