const ItemController = require('../../src/controllers/itemController');
const { Item, Event, Place } = require('../../src/models/eventModel');
const { Comment, Valoration, Response } = require('../../src/models/commentModel');
const { User } = require('../../src/models/userModel');
const { createOkResponse, createNotFoundResponse, createBadRequestResponse, createCreatedResponse, createForbiddenResponse } = require('../../src/utils/utils');

jest.mock('../../src/models/eventModel');
jest.mock('../../src/models/commentModel');
jest.mock('../../src/models/userModel');
jest.mock('../../src/utils/utils');

describe('ItemController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      userId: 'user123'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getItems', () => {
    it('should return items with pagination info', async () => {
      req.query = { type: 'Event', page: 1, limit: 2 };
      Event.aggregate.mockResolvedValue([{ title: 'Item 1' }, { title: 'Item 2' }]);
      Event.countDocuments.mockResolvedValue(4);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItems(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          items: expect.any(Array),
          currentPage: 1,
          totalPages: 2,
          totalItems: 4
        })
      }));
    });
  });

  describe('getItemById', () => {
    it('should return item if found', async () => {
      const mockItem = { title: 'Evento', _id: 'id123' };
      req.params.id = 'id123';
      req.query = { fields: 'title' };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockItem)),
      };

      Item.findOne.mockReturnValue(mockQuery);

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItemById(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: mockItem
      }));
    });

    it('should return 404 if item not found', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null),
        then: jest.fn(function(resolve) {
          return resolve(null);
        }),
      };

      Item.findOne.mockReturnValue(mockQuery);

      req.params.id = 'missing-id';
      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.getItemById(req, res);

      expect(res.json).toHaveBeenCalledWith({ msg: 'Item no encontrado' });
    });

  });

  describe('createComment', () => {
    it('should create a basic comment', async () => {
      req.params.id = 'item123';
      req.body = { text: 'Comentario' };
      const newComment = { _id: 'c1', text: 'Comentario' };

      Comment.create.mockResolvedValue(newComment);
      User.findByIdAndUpdate.mockResolvedValue();
      Item.findByIdAndUpdate.mockResolvedValue();
      createCreatedResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.createComment(req, res);

      expect(res.json).toHaveBeenCalledWith({ msg: 'Comentario creado exitosamente', data: newComment });
    });

    it('should prevent creating comment and valoration at once', async () => {
      req.body = { text: 'texto', value: 5 };
      req.params.commentId = 'reply123';
      createBadRequestResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.createComment(req, res);

      expect(res.json).toHaveBeenCalledWith({ msg: 'No puedes crear un comentario y una valoración al mismo tiempo' });
    });
  });

  describe('getItemComments', () => {
    it('should return comments of an item', async () => {
      req.params.id = 'item1';
      const comments = [{ text: 'Nice!' }];

      Item.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          comments
        })
      });

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));
    
      await ItemController.getItemComments(req, res);
    
      expect(res.json).toHaveBeenCalledWith({ msg: 'Comentarios obtenidos con éxito', data: comments });
    });

    it('should return 404 if item not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(null)),
      };

      Item.findOne.mockReturnValue(mockQuery);

      req.params.id = 'badId';
      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.getItemComments(req, res);

      expect(res.json).toHaveBeenCalledWith({ msg: 'Item no encontrado' });
    });
  });

  describe('getResponses', () => {
    it('should return responses for a comment', async () => {
      req.params = { commentId: 'c1', id: 'e1' };
      const mockResponses = [{ text: 'Reply' }];
      Response.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockResponses)
        })
      });

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getResponses(req, res);

      expect(res.json).toHaveBeenCalledWith({ msg: 'Respuestas obtenidas exitosamente', data: mockResponses });
    });
  });

  describe('deleteComment', () => {
    it('should delete comment and mark as deleted', async () => {
      req.params = { id: 'eventId', commentId: 'c123' };
      req.userId = 'u1';

      const comment = { user: 'u1', save: jest.fn() };
      const user = { _id: 'u1', admin: false };

      Comment.findById.mockResolvedValue(comment);
      User.findById.mockResolvedValue(user);
      Item.findById.mockResolvedValue({});

      Response.updateMany.mockResolvedValue();

      createOkResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.deleteComment(req, res);

      expect(comment.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: 'Comentario eliminado exitosamente' });
    });

    it('should forbid deletion if not owner or admin', async () => {
      req.params = { id: 'eventId', commentId: 'c123' };
      req.userId = 'u1';

      const comment = { user: 'u2' };
      const user = { _id: 'u1', admin: false };

      Comment.findById.mockResolvedValue(comment);
      User.findById.mockResolvedValue(user);

      createForbiddenResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.deleteComment(req, res);

      expect(res.json).toHaveBeenCalledWith({ msg: 'No tienes permiso para eliminar este comentario' });
    });
  });

  describe('getCategories', () => {
    it('should return categories', async () => {
      req.query = { type: 'Event' };
      const categories = ['música', 'teatro'];
      Item.distinct.mockResolvedValue(categories);

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getCategories(req, res);

      expect(res.json).toHaveBeenCalledWith({ msg: 'Categorías obtenidas exitosamente', data: categories });
    });
  });
});
