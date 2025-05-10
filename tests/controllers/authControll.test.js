const { User, UserPassword, UserGoogle } = require('../../src/models/userModel');
const authController = require('../../src/controllers/authController.js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');  

jest.mock('../../src/models/userModel.js');


jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, options) => (req, res, next) => next())
}));

describe('Test creacion de usuario', () => {

  beforeAll(async () => {
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
  });

  beforeEach(() => {
    User.create.mockClear();
  })

  it('Debería registrar un usuario correctamente', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        phone: '123456789'
      }
    };

    let res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const mockUserCreated = {
      password: "hashedPassword",
      email: "test@test.com",
      name: "Test User",
      phone: "123456789"
    }

    const mockUser = {
      active: true,
      admin: false,
      ...mockUserCreated
    }

    UserPassword.create.mockResolvedValue(mockUserCreated);
    await authController.register(req, res);
    expect(UserPassword.create).toHaveBeenCalledWith(mockUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Usuario creado exitosamente",
      data: {
        email: mockUser.email,
        name: mockUser.name
      }
    });
  });

  it('Debería fallar si el usuario ya existe', async () => {
    const reqUser1 = {
      body: {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        phone: '123456789'
      }
    };
  
    const reqUser2 = {
      body: {
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
        phone: '123456789'
      }
    }
  
    const mockUserCreated = {
      admin: false,
      active: true,
      ...reqUser1.body
    };
  
    UserPassword.findOne.mockResolvedValueOnce(null);  
    UserPassword.create.mockResolvedValue(mockUserCreated);
  
    let res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await authController.register(reqUser1, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Usuario creado exitosamente",
      data: {
        email: mockUserCreated.email,
        name: mockUserCreated.name
      }
    });
  
    UserPassword.findOne.mockResolvedValueOnce(mockUserCreated);
  
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  
    await authController.register(reqUser2, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "El email ya está registrado"
    });
  });

  it('Debería fallar si faltan campos requeridos', async () => {
    let req = {
      body: {
        email: 'test@test.com',
      }
    }

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Todos los campos son requeridos: email, password, name"
    });
  })
});

/*
describe('Test login de usuario', () => {

  beforeAll(async () => {
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
  });

  it('Debería iniciar sesión correctamente', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'password123'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const mockUser = {
      _id: 'mocked-user-id',
      email: 'test@test.com',
      name: 'Test User',
      password: 'hashedPassword',
      admin: false,
    };

    UserPassword.findOne.mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    const mockToken = 'mocked-jwt-token';
    jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

    await authController.login(req, res);

    expect(UserPassword.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: mockUser._id,
        email: mockUser.email,
        admin: mockUser.admin
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login exitoso',
      accessToken: mockToken,
      user: {
        id: mockUser._id,
        email: mockUser.email,
        name: mockUser.name,
        admin: mockUser.admin
      }
    });

  });

  it('Debería fallar si el usuario no existe', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'password123'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    UserPassword.findOne.mockResolvedValue(null);

    await authController.login(req, res);
    expect(UserPassword.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Usuario no encontrado'
    });
  });

  it('Debería fallar si la contraseña es incorrecta', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        password: 'password123'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const mockUser = {
      _id: '123456789',
      email: 'test@test.com',
      name: 'Test User',
      password: 'hashedPassword',
      admin: false
    };

    UserPassword.findOne.mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    await authController.login(req, res);

    expect(UserPassword.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser.password);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Contraseña incorrecta'
    });
  });

});
*/