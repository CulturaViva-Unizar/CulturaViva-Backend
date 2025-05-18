//TODO: fix this test

/*const UserController = require('../../src/controllers/userController');
const { User } = require('../../src/models/userModel');
const { Event, Item, Place } = require('../../src/models/eventModel');
const { Comment } = require('../../src/models/commentModel');
const { DisableUsers, SavedItemsStats } = require('../../src/models/statisticsModel');
const { toObjectId } = require('../../src/utils/utils');

jest.mock('../../src/models/userModel');
jest.mock('../../src/models/eventModel');
jest.mock('../../src/models/commentModel');
jest.mock('../../src/models/statisticsModel');
jest.mock('../../src/utils/utils');

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      userId: 'userId123'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('checkAdmin', () => {
    it('calls next if user is admin', async () => {
      User.findById.mockResolvedValue({ admin: true });
      await UserController.checkAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns 403 if user not admin', async () => {
      User.findById.mockResolvedValue({ admin: false });
      await UserController.checkAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });

  describe('checkAdminOrUser', () => {
    it('calls next if userId matches param id', async () => {
      req.params.id = req.userId;
      await UserController.checkAdminOrUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('calls next if user is admin', async () => {
      req.params.id = 'otherId';
      User.findById.mockResolvedValue({ admin: true });
      await UserController.checkAdminOrUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns 403 if user is not admin and ids dont match', async () => {
      req.params.id = 'otherId';
      User.findById.mockResolvedValue({ admin: false });
      await UserController.checkAdminOrUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });

    it('returns 500 if user not found', async () => {
      req.params.id = 'otherId';
      User.findById.mockResolvedValue(null);
      await UserController.checkAdminOrUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });

  describe('getUsers', () => {
    it('returns paginated users', async () => {
      req.query = { page: '1', limit: '2', sort: 'comments', order: 'desc' };
      const mockUsers = [{ id: '1' }, { id: '2' }];
      User.aggregate.mockResolvedValue(mockUsers);
      User.countDocuments.mockResolvedValue(2);

      await UserController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        data: expect.objectContaining({
          items: expect.any(Array),
          currentPage: 1,
          totalPages: 1,
          totalItems: 2
        })
      }));
    });
  });

  describe('getUserById', () => {
    it('returns user if found', async () => {
      req.params.id = 'user123';
      User.findById.mockResolvedValue({ id: 'user123', name: 'Test User' });

      await UserController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String),
        data: expect.objectContaining({ id: 'user123' })
      }));
    });

    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      User.findById.mockResolvedValue(null);

      await UserController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateProfile', () => {
    it('updates user and updates statistics', async () => {
      req.params.id = 'user123';
      req.body = { active: false };
      User.findByIdAndUpdate.mockResolvedValue({ id: 'user123' });
      DisableUsers.findOneAndUpdate = jest.fn().mockResolvedValue(true);

      await UserController.updateProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(DisableUsers.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });

    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      User.findByIdAndUpdate.mockResolvedValue(null);

      await UserController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getSavedItems', () => {
    it('returns saved items for user', async () => {
      req.params.id = 'user123';
      User.findById.mockResolvedValue({ savedItems: ['item1'] });
      Item.aggregate.mockResolvedValue([{ title: 'Item1' }]);

      await UserController.getSavedItems(req, res);

      expect(Item.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      User.findById.mockResolvedValue(null);

      await UserController.getSavedItems(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getUserComments', () => {
    it('returns comments for user', async () => {
      req.params.id = 'user123';
      User.findById.mockResolvedValue(true);
      Comment.find = jest.fn(() => ({
        populate: jest.fn(() => ({
          populate: jest.fn(() => ({
            sort: jest.fn().mockResolvedValue(['comment1'])
          }))
        }))
      }));

      await UserController.getUserComments(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: ['comment1'] }));
    });

    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      User.findById.mockResolvedValue(null);

      await UserController.getUserComments(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('saveItem', () => {
    it('adds item to savedItems if not already saved', async () => {
      req.params.id = 'user123';
      req.body = { eventId: 'event1' };
      const user = { savedItems: [], save: jest.fn() };
      User.findById.mockResolvedValue(user);
      SavedItemsStats.findOneAndUpdate = jest.fn();

      await UserController.saveItem(req, res);

      expect(user.savedItems.length).toBe(1);
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('attendItem', () => {
    it('adds event to user.asistsTo and user to event.asistentes', async () => {
      req.params.id = 'user123';
      req.body = { eventId: 'event1' };

      const user = { asistsTo: [], save: jest.fn() };
      const event = { asistentes: [], save: jest.fn() };

      User.findById.mockResolvedValue(user);
      Event.findById.mockResolvedValue(event);

      await UserController.attendItem(req, res);

      expect(user.asistsTo.length).toBe(1);
      expect(event.asistentes.length).toBe(1);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 404 if user or event not found', async () => {
      req.params.id = 'user123';
      req.body = { eventId: 'event1' };
      User.findById.mockResolvedValue(null);

      await UserController.attendItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);

      User.findById.mockResolvedValue({ asistsTo: [], save: jest.fn() });
      Event.findById.mockResolvedValue(null);

      await UserController.attendItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('removeSavedItem', () => {
    it('removes item from savedItems', async () => {
      req.params.id = 'user123';
      req.params.eventId = 'event1';
      toObjectId.mockImplementation(id => id); // Simplify

      const user = { savedItems: ['event1', 'event2'], save: jest.fn() };
      User.findById.mockResolvedValue(user);
      SavedItemsStats.findOneAndUpdate = jest.fn();

      await UserController.removeSavedItem(req, res);

      expect(user.savedItems).not.toContain('event1');
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('removeAttendingItem', () => {
    it('removes event from user.asistsTo and user from event.asistentes', async () => {
      req.params.id = 'user123';
      req.params.eventId = 'event1';

      toObjectId.mockImplementation(id => id);

      const user = { asistsTo: ['event1'], save: jest.fn() };
      const event = { asistentes: ['user123'], save: jest.fn() };

      User.findById.mockResolvedValue(user);
      Event.findById.mockResolvedValue(event);

      await UserController.removeAttendingItem(req, res);

      expect(user.asistsTo).not.toContain('event1');
      expect(event.asistentes).not.toContain('user123');
      expect(user.save).toHaveBeenCalled();
      expect(event.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // As the getUserChats uses createChatDTO from utils, you need to mock it accordingly.
  describe('getUserChats', () => {
    it('returns chats DTOs', async () => {
      req.params.id = 'user123';
      const chats = [{ id: 'chat1' }, { id: 'chat2' }];
      User.findById.mockResolvedValue({ chats });

      // Mock createChatDTO to just return a simple DTO
      jest.mock('../utils/chatUtils', () => ({
        createChatDTO: jest.fn(chat => Promise.resolve({ chatId: chat.id }))
      }));

      const { createChatDTO } = require('../utils/chatUtils');
      createChatDTO.mockImplementation(chat => Promise.resolve({ chatId: chat.id }));

      await UserController.getUserChats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(Array)
      }));
    });

    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      User.findById.mockResolvedValue(null);

      await UserController.getUserChats(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

});
*/