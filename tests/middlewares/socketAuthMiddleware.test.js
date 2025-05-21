// filepath: /workspaces/CulturaViva-Backend/tests/middlewares/socketAuthMiddleware.test.js
const jwt = require('jsonwebtoken');
const socketAuthMiddleware = require('../../src/middlewares/socketAuthMiddleware');

// Mock de variables de entorno
process.env.JWT_SECRET = 'test-secret-key';

describe('Socket Authentication Middleware', () => {
  let mockSocket;
  let mockNext;
  
  beforeEach(() => {
    // Reinicializar mocks antes de cada prueba
    mockSocket = {
      handshake: {
        headers: {}
      },
      user: null
    };
    
    mockNext = jest.fn();
  });
  
  it('debe permitir la conexión con un token válido', async () => {
    // Crear un payload de usuario de prueba
    const mockUser = { id: '123', username: 'testuser' };
    
    // Generar un token válido
    const validToken = jwt.sign(mockUser, process.env.JWT_SECRET);
    
    // Configurar el socket con el token en el header de autorización
    mockSocket.handshake.headers['authorization'] = `Bearer ${validToken}`;
    
    // Ejecutar el middleware
    await socketAuthMiddleware(mockSocket, mockNext);
    
    // Verificar que next() fue llamado sin error
    expect(mockNext).toHaveBeenCalledWith();
    
    // Verificar que el usuario decodificado se asignó al socket
    expect(mockSocket.user).toBeDefined();
    expect(mockSocket.user.id).toBe(mockUser.id);
    expect(mockSocket.user.username).toBe(mockUser.username);
  });
  
  it('debe rechazar la conexión cuando no se proporciona un token', async () => {
    // No configuramos ningún token en el header
    
    // Ejecutar el middleware
    await socketAuthMiddleware(mockSocket, mockNext);
    
    // Verificar que next() fue llamado con un error
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Token de autenticación no proporcionado');
    
    // Verificar que el usuario no se asignó al socket
    expect(mockSocket.user).toBeNull();
  });
  
  it('debe rechazar la conexión con un token inválido', async () => {
    // Configurar el socket con un token inválido
    mockSocket.handshake.headers['authorization'] = 'Bearer invalid-token';
    
    // Ejecutar el middleware
    await socketAuthMiddleware(mockSocket, mockNext);
    
    // Verificar que next() fue llamado con un error
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Token inválido o expirado');
    
    // Verificar que el usuario no se asignó al socket
    expect(mockSocket.user).toBeNull();
  });
  
  it('debe rechazar la conexión con un token expirado', async () => {
    // Crear un payload de usuario de prueba
    const mockUser = { id: '123', username: 'testuser' };
    
    // Generar un token que expire inmediatamente
    const expiredToken = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: '0s' });
    
    // Esperar un momento para asegurar que el token expire
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Configurar el socket con el token expirado
    mockSocket.handshake.headers['authorization'] = `Bearer ${expiredToken}`;
    
    // Ejecutar el middleware
    await socketAuthMiddleware(mockSocket, mockNext);
    
    // Verificar que next() fue llamado con un error
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Token inválido o expirado');
    
    // Verificar que el usuario no se asignó al socket
    expect(mockSocket.user).toBeNull();
  });
  
  it('debe manejar correctamente formatos de token malformados', async () => {
    // Configurar el socket con un token mal formateado (sin la parte "Bearer")
    mockSocket.handshake.headers['authorization'] = 'malformed-token';
    
    // Ejecutar el middleware
    await socketAuthMiddleware(mockSocket, mockNext);
    
    // Verificar que next() fue llamado con un error
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockNext.mock.calls[0][0].message).toBe('Token inválido o expirado');
  });
});