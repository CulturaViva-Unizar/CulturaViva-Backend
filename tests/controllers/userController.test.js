// Al inicio del fichero, junto a los otros imports
const emailUtils = require('../../src/mailer/mailer');

// Mock global para sendNotification, que resuelve sin hacer nada
jest.spyOn(emailUtils, 'sendNotification').mockImplementation(() => Promise.resolve());

const UserController = require('../../src/controllers/userController');
const { User } = require('../../src/models/userModel');
const { Event, Item, Place } = require('../../src/models/eventModel');
const { Comment } = require('../../src/models/commentModel');
const { DisableUsers, SavedItemsStats } = require('../../src/models/statisticsModel');
const { toObjectId } = require('../../src/utils/utils');
const { createOkResponse, createNotFoundResponse, createBadRequestResponse, createCreatedResponse, createForbiddenResponse, createInternalServerErrorResponse } = require('../../src/utils/utils');

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

  it('returns 403 if user not admin and ids don’t match', async () => {
    req.userId = '789';
    req.params.id = '123';
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    next = jest.fn();

    User.findById.mockResolvedValue({ admin: false, _id: '789' });

    // Simula createForbiddenResponse devolviendo una respuesta 403
    createForbiddenResponse.mockImplementation((res, msg) => res.status(403).json({ msg }));

    await UserController.checkAdminOrUser(req, res, next);

    expect(createForbiddenResponse).toHaveBeenCalledWith(res, "Acceso no autorizado al recurso.");
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: "Acceso no autorizado al recurso." });
    expect(next).not.toHaveBeenCalled();
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

    it('returns 403 if user is not admin and ids don’t match', async () => {
      req.userId = '789';
      req.params.id = 'otherId';
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      next = jest.fn();

      User.findById.mockResolvedValue({ admin: false, _id: '789' });

      createForbiddenResponse.mockImplementation((res, msg) => res.status(403).json({ msg }));

      await UserController.checkAdminOrUser(req, res, next);

      expect(createForbiddenResponse).toHaveBeenCalledWith(res, "Acceso no autorizado al recurso.");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: "Acceso no autorizado al recurso." });
      expect(next).not.toHaveBeenCalled();
    });
    it('returns 500 if user not found', async () => {
      req.userId = '789';
      req.params.id = 'otherId';
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      next = jest.fn();

      User.findById.mockResolvedValue(null);

      createInternalServerErrorResponse.mockImplementation((res, msg) => res.status(500).json({ msg }));

      await UserController.checkAdminOrUser(req, res, next);

      expect(createInternalServerErrorResponse).toHaveBeenCalledWith(res, "Error interno del servidor.");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: "Error interno del servidor." });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('returns paginated users with createOKResponse', async () => {
      req.query = { page: '1', limit: '2', sort: 'comments', order: 'desc' };
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      next = jest.fn();

      const mockUsers = [{ id: '1' }, { id: '2' }];
      User.aggregate.mockResolvedValue(mockUsers);
      User.countDocuments.mockResolvedValue(2);

      createOkResponse.mockImplementation((res, msg, data) => 
        res.status(200).json({ msg, data })
      );

      await UserController.getUsers(req, res);

      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        expect.any(String),
        expect.objectContaining({
          items: expect.any(Array),
          currentPage: expect.any(Number),
          totalPages: expect.any(Number),
          totalItems: expect.any(Number),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: expect.any(String),
        data: expect.objectContaining({
          items: expect.any(Array),
          currentPage: 1,
          totalPages: 1,
          totalItems: 2
        })
      }));
      expect(next).not.toHaveBeenCalled();
    });

  });

  describe('getUserById', () => {
    it('returns user if found', async () => {
      req.params.id = 'user123';
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      // Mock de la cadena findById().select()
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ id: 'user123', name: 'Test User' })
      };
      User.findById.mockReturnValue(mockQuery);

      createOkResponse.mockImplementation((res, msg, data) =>
        res.status(200).json({ msg, data })
      );

      await UserController.getUserById(req, res);

      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        expect.any(String),
        expect.objectContaining({ id: 'user123' })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: expect.any(String),
        data: expect.objectContaining({ id: 'user123' }),
      }));
    });

    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      // Mock para findById().select() que resuelve null (usuario no encontrado)
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null),
      };
      User.findById.mockReturnValue(mockQuery);

      createNotFoundResponse.mockImplementation((res, msg) => res.status(404).json({ msg }));

      await UserController.getUserById(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Usuario no encontrado');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
    });

  });

  describe('updateProfile', () => {
  it('updates user and updates statistics', async () => {
      req.params.id = 'user123';
      req.body = { active: false };

      // Asegúrate que estos métodos también están mockeados
      User.findByIdAndUpdate = jest.fn().mockResolvedValue({ id: 'user123' });
      DisableUsers.findOneAndUpdate = jest.fn().mockResolvedValue(true);

      await UserController.updateProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(DisableUsers.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.any(String) }));
    });

    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      User.findByIdAndUpdate.mockResolvedValue(null);

      createNotFoundResponse.mockImplementation((res, msg) => res.status(404).json({ msg }));

      await UserController.updateProfile(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Usuario no encontrado');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
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
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      User.findById.mockResolvedValue(null);

      createNotFoundResponse.mockImplementation((res, msg) => res.status(404).json({ msg }));

      await UserController.getSavedItems(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Usuario no encontrado');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
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
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      User.findById.mockResolvedValue(null);

      createNotFoundResponse.mockImplementation((res, msg) => res.status(404).json({ msg }));

      await UserController.getUserComments(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Usuario no encontrado');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
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
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      // Mock de createNotFoundResponse
      createNotFoundResponse.mockImplementation((res, msg) => res.status(404).json({ msg }));

      // Caso: usuario no encontrado
      User.findById.mockResolvedValue(null);

      await UserController.attendItem(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Usuario no encontrado');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });

      // Caso: evento no encontrado
      User.findById.mockResolvedValue({ asistsTo: [], save: jest.fn() });
      Event.findById.mockResolvedValue(null);

      await UserController.attendItem(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Evento no encontrado');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Evento no encontrado' });
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
    it('returns chats DTOs', async () => {
      req.params.id = 'user123';

      const chats = [
        { id: 'chat1', user1: 'user123', user2: 'user456' },
        { id: 'chat2', user1: 'user789', user2: 'user123' }
      ];

      // Mock para createChatDTO
      const chatUtils = require('../../src/utils/chatUtils');
      jest.spyOn(chatUtils, 'createChatDTO').mockImplementation(chat => Promise.resolve({ chatId: chat.id }));

      User.findById = jest.fn((id) => {
        if (id === req.params.id) {
          return {
            populate: jest.fn().mockResolvedValue({ chats }),
          };
        } else {
          return {
            select: jest.fn().mockResolvedValue({ name: 'Other User' }),
          };
        }
      });

      await UserController.getUserChats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.any(Array)
      }));
    });



    it('returns 404 if user not found', async () => {
      req.params.id = 'user123';
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();

      // Simular el encadenamiento findById().populate()
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
      User.findById.mockReturnValue(mockQuery);

      createNotFoundResponse.mockImplementation((res, msg) => res.status(404).json({ msg }));

      await UserController.getUserChats(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Usuario no encontrado');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
    });
  });
