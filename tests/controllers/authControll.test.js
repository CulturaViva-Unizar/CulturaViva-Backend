const { UserPassword } = require('../../src/models/userModel.js');
const authController = require('../../src/controllers/authController.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUserDto, signJwt } = require('../../src/utils/authUtils.js');

jest.mock('../../src/models/userModel.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/utils/authUtils.js');
jest.mock('../../src/logger/logger.js');

describe('AuthController', () => {
  describe('register', () => {
    it('Debería registrar un usuario correctamente con datos válidos', async () => {
      const req = {
        body: {
          email: 'nuevo@test.com',
          password: 'password123',
          name: 'Nuevo Usuario',
          phone: '123456789'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      const createdUser = {
        _id: 'new-user-id',
        email: 'nuevo@test.com',
        password: 'hashedPassword',
        name: 'Nuevo Usuario',
        admin: false,
        active: true,
        phone: '123456789'
      };
      
      UserPassword.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      UserPassword.create.mockResolvedValue(createdUser);
      
      await authController.register(req, res, next);
      
      expect(UserPassword.findOne).toHaveBeenCalledWith({ email: req.body.email.toLowerCase() });
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
      expect(UserPassword.create).toHaveBeenCalledWith({
        email: req.body.email.toLowerCase(),
        password: 'hashedPassword',
        name: req.body.name,
        phone: req.body.phone,
        admin: false,
        active: true
      });
      expect(req.user).toEqual(createdUser);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(next).toHaveBeenCalled();
    });
    
    it('Debería fallar si faltan campos requeridos', async () => {
      const req = {
        body: {
          email: 'falta@test.com',
          // Falta password
          name: 'Usuario Incompleto'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      await authController.register(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Todos los campos son requeridos: email, password, name',
        data: null
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('Debería fallar si el email ya está registrado', async () => {
      const req = {
        body: {
          email: 'existente@test.com',
          password: 'password123',
          name: 'Usuario Existente',
          phone: '123456789'
        }
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      const next = jest.fn();
      
      const existingUser = {
        email: 'existente@test.com'
      };
      
      UserPassword.findOne.mockResolvedValue(existingUser);
      
      await authController.register(req, res, next);
      
      expect(UserPassword.findOne).toHaveBeenCalledWith({ email: req.body.email.toLowerCase() });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'El email ya está registrado',
        data: null
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
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
});
