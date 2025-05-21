
const Message = require('../../src/models/messageModel');
const Chat = require('../../src/models/chatModel');
const chatUtils = require('../../src/utils/chatUtils');
const logger = require('../../src/logger/logger.js');

// Mocks
jest.mock('../../src/models/messageModel');
jest.mock('../../src/models/chatModel');
jest.mock('../../src/utils/chatUtils');
jest.mock('../../src/logger/logger.js');

describe('SocketHandler', () => {
  let io, socket, socketHandler;
  
  beforeEach(() => {
    // Resetear mocks
    jest.clearAllMocks();
    
    // Mock para io
    io = {
      on: jest.fn((event, callback) => {
        if (event === 'connection') {
          callback(socket);
        }
      }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };
    
    // Mock para socket
    socket = {
      id: 'socket-id-123',
      user: { id: 'user-id-123' },
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      on: jest.fn((event, callback) => {
        socketEvents[event] = callback;
      })
    };
    
    // Almacenar callbacks de eventos de socket para poder llamarlos en las pruebas
    const socketEvents = {};
    
    // Ejecutar el handler con el io mockeado
    socketHandler = require('../../src/sockets/socketHandler')(io);
  });
  
  describe('connection', () => {
    it('debe registrar la conexión de un nuevo cliente', () => {
      expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith('Nuevo cliente conectado', {
        socketId: 'socket-id-123',
        userId: 'user-id-123'
      });
    });
  });
  
  describe('joinChat', () => {
    it('debe permitir a un usuario unirse a un chat si tiene permiso', async () => {
      // Simular que el usuario tiene permiso
      chatUtils.isUserInChat.mockResolvedValue(true);
      
      // Obtener el callback de 'joinChat' y ejecutarlo
      const joinChatCallback = socket.on.mock.calls.find(call => call[0] === 'joinChat')[1];
      await joinChatCallback('chat-id-123');
      
      expect(chatUtils.isUserInChat).toHaveBeenCalledWith('user-id-123', 'chat-id-123');
      expect(socket.join).toHaveBeenCalledWith('chat-id-123');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('se unió al chat'), 
        expect.any(Object)
      );
    });
    
    it('debe rechazar a un usuario si no tiene permiso para unirse al chat', async () => {
      // Simular que el usuario NO tiene permiso
      chatUtils.isUserInChat.mockResolvedValue(false);
      
      // Obtener el callback de 'joinChat' y ejecutarlo
      const joinChatCallback = socket.on.mock.calls.find(call => call[0] === 'joinChat')[1];
      await joinChatCallback('chat-id-123');
      
      expect(chatUtils.isUserInChat).toHaveBeenCalledWith('user-id-123', 'chat-id-123');
      expect(socket.join).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('errorMessage', { error: 'No tienes acceso a este chat' });
      expect(logger.error).toHaveBeenCalled();
    });
  });
  
  describe('leaveChat', () => {
    it('debe permitir a un usuario abandonar un chat', () => {
      // Obtener el callback de 'leaveChat' y ejecutarlo
      const leaveChatCallback = socket.on.mock.calls.find(call => call[0] === 'leaveChat')[1];
      leaveChatCallback('chat-id-123');
      
      expect(socket.leave).toHaveBeenCalledWith('chat-id-123');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('abandonó el chat'), 
        expect.any(Object)
      );
    });
  });
  
  describe('sendMessage', () => {
    it('debe permitir enviar un mensaje si el usuario tiene permisos', async () => {
      // Simular que el usuario tiene permiso y es quien dice ser
      chatUtils.isUserInChat.mockResolvedValue(true);
      chatUtils.checkIsWhoHeSays.mockResolvedValue(true);
      
      const messageData = {
        text: 'Hola, ¿cómo estás?',
        userId: 'user-id-123',
        chatId: 'chat-id-123'
      };
      
      const createdMessage = {
        _id: 'message-id-123',
        text: messageData.text,
        user: messageData.userId,
        chat: messageData.chatId,
        timestamp: new Date()
      };
      
      Message.create.mockResolvedValue(createdMessage);
      Chat.findByIdAndUpdate.mockResolvedValue({});
      
      // Obtener el callback de 'sendMessage' y ejecutarlo
      const sendMessageCallback = socket.on.mock.calls.find(call => call[0] === 'sendMessage')[1];
      await sendMessageCallback(messageData);
      
      expect(chatUtils.isUserInChat).toHaveBeenCalledWith('user-id-123', 'chat-id-123');
      expect(chatUtils.checkIsWhoHeSays).toHaveBeenCalledWith('user-id-123', 'user-id-123');
      
      expect(Message.create).toHaveBeenCalledWith({
        text: messageData.text,
        user: messageData.userId,
        chat: messageData.chatId
      });
      
      expect(Chat.findByIdAndUpdate).toHaveBeenCalledWith(
        'chat-id-123', 
        { $push: { mensajes: 'message-id-123' } }
      );
      
      expect(io.to).toHaveBeenCalledWith('chat-id-123');
      expect(io.emit).toHaveBeenCalledWith('receiveMessage', {
        _id: createdMessage._id,
        text: createdMessage.text,
        timestamp: createdMessage.timestamp,
        user: messageData.userId,
        chat: messageData.chatId
      });
    });
    
    it('debe rechazar el mensaje si el usuario no tiene permisos', async () => {
      // Simular que el usuario NO tiene permiso
      chatUtils.isUserInChat.mockResolvedValue(false);
      chatUtils.checkIsWhoHeSays.mockResolvedValue(true);
      
      const messageData = {
        text: 'Este mensaje no debería enviarse',
        userId: 'user-id-123',
        chatId: 'chat-id-123'
      };
      
      // Obtener el callback de 'sendMessage' y ejecutarlo
      const sendMessageCallback = socket.on.mock.calls.find(call => call[0] === 'sendMessage')[1];
      await sendMessageCallback(messageData);
      
      expect(socket.emit).toHaveBeenCalledWith('errorMessage', { error: 'No tienes acceso a este chat' });
      expect(Message.create).not.toHaveBeenCalled();
      expect(Chat.findByIdAndUpdate).not.toHaveBeenCalled();
    });
    
    it('debe rechazar el mensaje si el usuario no es quien dice ser', async () => {
      // Usuario está en el chat pero dice que es otro usuario
      chatUtils.isUserInChat.mockResolvedValue(true);
      chatUtils.checkIsWhoHeSays.mockResolvedValue(false);
      
      const messageData = {
        text: 'Este mensaje no debería enviarse',
        userId: 'otro-usuario-id',
        chatId: 'chat-id-123'
      };
      
      // Obtener el callback de 'sendMessage' y ejecutarlo
      const sendMessageCallback = socket.on.mock.calls.find(call => call[0] === 'sendMessage')[1];
      await sendMessageCallback(messageData);
      
      expect(socket.emit).toHaveBeenCalledWith('errorMessage', { error: 'No tienes acceso a este chat' });
      expect(Message.create).not.toHaveBeenCalled();
    });
    
    it('debe manejar errores durante el envío de mensajes', async () => {
      // Simular que el usuario tiene permiso
      chatUtils.isUserInChat.mockResolvedValue(true);
      chatUtils.checkIsWhoHeSays.mockResolvedValue(true);
      
      // Simular un error durante la creación del mensaje
      const mockError = new Error('Error al crear mensaje');
      Message.create.mockRejectedValue(mockError);
      
      const messageData = {
        text: 'Este mensaje generará un error',
        userId: 'user-id-123',
        chatId: 'chat-id-123'
      };
      
      // Obtener el callback de 'sendMessage' y ejecutarlo
      const sendMessageCallback = socket.on.mock.calls.find(call => call[0] === 'sendMessage')[1];
      await sendMessageCallback(messageData);
      
      expect(logger.error).toHaveBeenCalledWith(
        'Error al enviar el mensaje', 
        expect.objectContaining({
          message: mockError.message
        })
      );
      expect(socket.emit).toHaveBeenCalledWith('errorMessage', { error: 'No se pudo enviar el mensaje' });
    });
  });
  
  describe('disconnect', () => {
    it('debe registrar cuando un cliente se desconecta', () => {
      // Obtener el callback de 'disconnect' y ejecutarlo
      const disconnectCallback = socket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
      disconnectCallback();
      
      expect(logger.info).toHaveBeenCalledWith('Cliente desconectado', {
        socketId: 'socket-id-123',
        userId: 'user-id-123'
      });
    });
  });
});