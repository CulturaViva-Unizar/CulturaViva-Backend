const { isUserInChat, checkIsWhoHeSays, createChatDTO } = require('../../src/utils/chatUtils');
const Chat = require('../../src/models/chatModel');
const { User } = require('../../src/models/userModel');
const mongoose = require('mongoose');

// Mock de los modelos
jest.mock('../../src/models/chatModel');
jest.mock('../../src/models/userModel');

describe('ChatUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isUserInChat', () => {
    it('debe retornar false si el chat no existe', async () => {
      
      const userId = 'user123';
      const chatId = 'chat456';
      Chat.findById.mockResolvedValue(null);

      
      const result = await isUserInChat(userId, chatId);

      
      expect(result).toBe(false);
      expect(Chat.findById).toHaveBeenCalledWith(chatId);
    });

    it('debe retornar true si el usuario es user1 en el chat', async () => {
      
      const userId = 'user123';
      const chatId = 'chat456';
      const mockChat = {
        user1: {
          toString: () => userId
        },
        user2: {
          toString: () => 'otherUser789'
        }
      };
      Chat.findById.mockResolvedValue(mockChat);

      
      const result = await isUserInChat(userId, chatId);

      
      expect(result).toBe(true);
      expect(Chat.findById).toHaveBeenCalledWith(chatId);
    });

    it('debe retornar true si el usuario es user2 en el chat', async () => {
      
      const userId = 'user123';
      const chatId = 'chat456';
      const mockChat = {
        user1: {
          toString: () => 'otherUser789'
        },
        user2: {
          toString: () => userId
        }
      };
      Chat.findById.mockResolvedValue(mockChat);

      
      const result = await isUserInChat(userId, chatId);

      
      expect(result).toBe(true);
      expect(Chat.findById).toHaveBeenCalledWith(chatId);
    });

    it('debe retornar false si el usuario no está en el chat', async () => {
      
      const userId = 'user123';
      const chatId = 'chat456';
      const mockChat = {
        user1: {
          toString: () => 'otherUser789'
        },
        user2: {
          toString: () => 'anotherUser101'
        }
      };
      Chat.findById.mockResolvedValue(mockChat);

      
      const result = await isUserInChat(userId, chatId);

      
      expect(result).toBe(false);
      expect(Chat.findById).toHaveBeenCalledWith(chatId);
    });
  });

  describe('checkIsWhoHeSays', () => {
    it('debe retornar true si los IDs coinciden', async () => {
      
      const userId = 'user123';
      const jwtUserId = 'user123';

      
      const result = await checkIsWhoHeSays(userId, jwtUserId);

      
      expect(result).toBe(true);
    });

    it('debe retornar false si los IDs no coinciden', async () => {
      
      const userId = 'user123';
      const jwtUserId = 'differentUser456';

      
      const result = await checkIsWhoHeSays(userId, jwtUserId);

      
      expect(result).toBe(false);
    });
  });

    it('debe manejar ObjectID de mongoose', async () => {
      
      const userId = new mongoose.Types.ObjectId('6457b8f83717916d86337c72');
      const otherUserId = new mongoose.Types.ObjectId('6457b8f83717916d86337c73');
      
      const mockChat = {
        _id: 'chat789',
        user1: otherUserId,
        user2: userId,
        mensajes: ['mensaje1', 'mensaje2'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      };
      
      const mockOtherUser = {
        _id: otherUserId.toString(),
        name: 'Other User'
      };
      
      const mockSelect = jest.fn().mockResolvedValue(mockOtherUser);
      User.findById.mockReturnValue({
        select: mockSelect
      });

      
      const result = await createChatDTO(mockChat, userId);

      
      expect(result).toEqual({
        mensajes: ['mensaje1', 'mensaje2'],
        id: 'chat789',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        user: mockOtherUser
      });
      expect(User.findById).toHaveBeenCalledWith(otherUserId);
      expect(mockSelect).toHaveBeenCalledWith('name -userType');
    });
});