const UserModel = require('../../src/models/userModel.js');
const authController = require('../../src/controllers/authController.js');
const bcrypt = require('bcrypt')

jest.mock('../../src/models/userModel.js');


jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, options) => (req, res, next) => next())
}));

describe('Test creacion de usuario', () => {

  beforeAll(async () => {
    bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
  });

  beforeEach(() => {
    UserModel.create.mockClear();
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

    UserModel.create.mockResolvedValue(mockUserCreated);
    await authController.register(req, res);
    expect(UserModel.create).toHaveBeenCalledWith(mockUser);
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
  
    UserModel.findOne.mockResolvedValueOnce(null);  
    UserModel.create.mockResolvedValue(mockUserCreated);
  
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
  
    UserModel.findOne.mockResolvedValueOnce(mockUserCreated);
  
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
      message: "Todos los campos son requeridos: email, password, name, phone"
    });
  })
});