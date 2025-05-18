const ChatController = require('../../src/controllers/chatController');
const Chat = require('../../src/models/chatModel');
const Message = require('../../src/models/messageModel');
const { User } = require('../../src/models/userModel');
const { isUserInChat, createChatDTO } = require('../../src/utils/chatUtils');
const {
  createNotFoundResponse,
  createForbiddenResponse,
  createConflictResponse,
  createBadRequestResponse,
  createCreatedResponse,
  createOkResponse
} = require('../../src/utils/utils');

jest.mock('../../src/models/chatModel');
jest.mock('../../src/models/messageModel');
jest.mock('../../src/models/userModel');
jest.mock('../../src/utils/chatUtils');
jest.mock('../../src/utils/utils');

describe('ChatController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserInChat', () => {
    it('debería continuar si el usuario está en el chat', async () => {
      const req = { userId: 'user123', params: { chatId: 'chat123' } };
      const res = {};
      const next = jest.fn();

      Chat.findById.mockResolvedValue({ _id: 'chat123' });
      isUserInChat.mockReturnValue(true);

      await ChatController.checkUserInChat(req, res, next);

      expect(Chat.findById).toHaveBeenCalledWith('chat123');
      expect(isUserInChat).toHaveBeenCalledWith('user123', 'chat123');
      expect(next).toHaveBeenCalled();
    });

    it('debería devolver 404 si el chat no existe', async () => {
      const req = { userId: 'user123', params: { chatId: 'chat123' } };
      const res = {};
      const next = jest.fn();

      Chat.findById.mockResolvedValue(null);

      await ChatController.checkUserInChat(req, res, next);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Chat no encontrado');
    });

    it('debería devolver 403 si el usuario no pertenece al chat', async () => {
      const req = { userId: 'user123', params: { chatId: 'chat123' } };
      const res = {};
      const next = jest.fn();

      Chat.findById.mockResolvedValue({ _id: 'chat123' });
      isUserInChat.mockReturnValue(false);

      await ChatController.checkUserInChat(req, res, next);

      expect(createForbiddenResponse).toHaveBeenCalledWith(res, 'No tienes permiso para acceder a este chat');
    });
  });

  describe('createChat', () => {
    it('debería devolver conflicto si ya existe un chat', async () => {
      const req = { userId: 'user1', body: { user: 'user2' } };
      const res = {};

      Chat.findOne.mockResolvedValue({ _id: 'chat123' });

      await ChatController.createChat(req, res);

      expect(Chat.findOne).toHaveBeenCalled();
      expect(createConflictResponse).toHaveBeenCalledWith(res, 'Ya existe un chat entre estos usuarios');
    });

    it('debería devolver error si intenta crear un chat consigo mismo', async () => {
      const req = { userId: 'user1', body: { user: 'user1' } };
      const res = {};

      await ChatController.createChat(req, res);

      expect(createBadRequestResponse).toHaveBeenCalledWith(res, 'No puedes crear un chat contigo mismo');
    });

    it('debería crear un chat correctamente', async () => {
      const req = { userId: 'user1', body: { user: 'user2' } };
      const res = {};

      Chat.findOne.mockResolvedValue(null);
      const savedChat = { _id: 'chatNew', user1: 'user1', user2: 'user2' };
      Chat.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(savedChat),
        _id: 'chatNew',
        user1: 'user1',
        user2: 'user2',
      }));
      createChatDTO.mockResolvedValue({ id: 'chatNew', messages: [] });

      await ChatController.createChat(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(createCreatedResponse).toHaveBeenCalledWith(
        res,
        'Chat creado exitosamente',
        { id: 'chatNew', messages: [] }
      );
    });
  });

  describe('getChatMessages', () => {
    it('debería devolver mensajes si el chat existe', async () => {
      const req = { params: { chatId: 'chat123' } };
      const res = {};

      const chat = { mensajes: ['msg1', 'msg2'] };
      Chat.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(chat) });

      await ChatController.getChatMessages(req, res);

      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        'Mensajes del chat encontrados',
        ['msg1', 'msg2']
      );
    });

    it('debería devolver 404 si el chat no existe', async () => {
      const req = { params: { chatId: 'chat123' } };
      const res = {};

      Chat.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

      await ChatController.getChatMessages(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Chat no encontrado');
    });
  });
});
