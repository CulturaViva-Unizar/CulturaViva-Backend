// Al inicio del fichero, junto a los otros imports
const emailUtils = require('../../src/mailer/mailer');
const pipelineUtils = require('../../src/utils/pipelineUtils');

// Mock global para sendNotification, que resuelve sin hacer nada
jest.spyOn(emailUtils, 'sendNotification').mockImplementation(() => Promise.resolve());
jest.mock('../../src/utils/pipelineUtils', () => ({
  buildAggregationPipeline: jest.fn().mockReturnValue(['stage1', 'stage2'])
}));

const ItemController = require('../../src/controllers/itemController');
const { Item, Event, Place } = require('../../src/models/eventModel');
const { Comment, Valoration, Response } = require('../../src/models/commentModel');
const { User } = require('../../src/models/userModel');
const { 
  createOkResponse, 
  createNotFoundResponse, 
  createBadRequestResponse, 
  createCreatedResponse, 
  createForbiddenResponse,
  toObjectId,
  generateOID,
  escapeRegExp
} = require('../../src/utils/utils');

// Mocks completos
jest.mock('../../src/models/eventModel');
jest.mock('../../src/models/commentModel');
jest.mock('../../src/models/userModel');
jest.mock('../../src/utils/utils', () => ({
  toObjectId: jest.fn(id => id),
  generateOID: jest.fn(id => `generatedId_${id}`),
  escapeRegExp: jest.fn(str => str),
  createOkResponse: jest.fn(),
  createNotFoundResponse: jest.fn(),
  createBadRequestResponse: jest.fn(),
  createCreatedResponse: jest.fn(),
  createForbiddenResponse: jest.fn()
}));

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

      expect(pipelineUtils.buildAggregationPipeline).toHaveBeenCalled();
      expect(Event.aggregate).toHaveBeenCalledWith(['stage1', 'stage2']);
      expect(Event.countDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          items: expect.any(Array),
          currentPage: 1,
          totalPages: 2,
          totalItems: 4
        })
      }));
    });

    it('should handle Place items', async () => {
      req.query = { type: 'Place', page: 1, limit: 2 };
      Place.aggregate.mockResolvedValue([{ title: 'Place 1' }, { title: 'Place 2' }]);
      Place.countDocuments.mockResolvedValue(3);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItems(req, res);

      expect(Place.aggregate).toHaveBeenCalledWith(['stage1', 'stage2']);
      expect(Place.countDocuments).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          items: expect.any(Array),
          currentPage: 1,
          totalPages: 2,
          totalItems: 3
        })
      }));
    });

    it('should apply name filter if provided', async () => {
      req.query = { type: 'Event', name: 'test name' };
      Event.aggregate.mockResolvedValue([]);
      Event.countDocuments.mockResolvedValue(0);
      escapeRegExp.mockReturnValue('escaped_test_name');
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItems(req, res);

      expect(escapeRegExp).toHaveBeenCalledWith('test name');
      expect(pipelineUtils.buildAggregationPipeline).toHaveBeenCalledWith(
        expect.objectContaining({
          title: { $regex: 'escaped_test_name', $options: 'i' }
        }),
        expect.any(Object)
      );
    });

    it('should apply date filters if provided', async () => {
      const testDate1 = '2025-01-01';
      const testDate2 = '2025-12-31';
      req.query = { type: 'Event', startDate: testDate1, endDate: testDate2 };
      Event.aggregate.mockResolvedValue([]);
      Event.countDocuments.mockResolvedValue(0);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItems(req, res);

      // Verificar que buildAggregationPipeline fue llamado con los filtros de fecha correctos
      const buildPipelineCall = pipelineUtils.buildAggregationPipeline.mock.calls[0][0];
      expect(buildPipelineCall.startDate.$gte).toBeInstanceOf(Date);
      expect(buildPipelineCall.endDate.$lte).toBeInstanceOf(Date);
    });

    it('should apply category filter if provided', async () => {
      req.query = { type: 'Event', category: 'música' };
      Event.aggregate.mockResolvedValue([]);
      Event.countDocuments.mockResolvedValue(0);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItems(req, res);

      expect(pipelineUtils.buildAggregationPipeline).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'música' }),
        expect.any(Object)
      );
    });
  });

  describe('getItemById', () => {
    it('should return item if found', async () => {
      const mockItem = { title: 'Evento', _id: 'id123' };
      req.params.id = 'id123';
      req.query = { fields: 'title', type: 'Event' };

      // Configuración correcta del mock para simular el comportamiento de Mongoose
      const mockQuery = {
        select: jest.fn().mockReturnThis()
      };
      mockQuery.then = callback => Promise.resolve(callback(mockItem));
      Item.findOne.mockReturnValue(mockQuery);

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItemById(req, res);

      expect(Item.findOne).toHaveBeenCalledWith({ 
        _id: 'id123', 
        itemType: 'Event' 
      });
      expect(mockQuery.select).toHaveBeenCalledWith('title');
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Item obtenido con éxito', mockItem);
    });

    it('should handle request without fields', async () => {
      const mockItem = { title: 'Evento', _id: 'id123' };
      req.params.id = 'id123';
      req.query = { type: 'Place' }; // Sin fields

      Item.findOne.mockResolvedValue(mockItem);

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getItemById(req, res);

      expect(Item.findOne).toHaveBeenCalledWith({ 
        _id: 'id123', 
        itemType: 'Place' 
      });
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Item obtenido con éxito', mockItem);
    });

    it('should return 404 if item not found', async () => {
      req.params.id = 'missing-id';
      Item.findOne.mockResolvedValue(null);

      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.getItemById(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Item no encontrado');
    });
  });

  describe('guardarEventos', () => {
    it('should not do anything if events array is empty', async () => {
      await ItemController.guardarEventos([]);
      expect(Event.updateOne).not.toHaveBeenCalled();
    });

    it('should save multiple events', async () => {
      const eventos = [
        { id: '123', title: 'Event 1' },
        { id: '456', title: 'Event 2' }
      ];
      
      Event.updateOne.mockResolvedValue({});
      generateOID.mockImplementationOnce(() => 'generatedId_123')
                 .mockImplementationOnce(() => 'generatedId_456');

      await ItemController.guardarEventos(eventos);

      expect(generateOID).toHaveBeenCalledTimes(2);
      expect(Event.updateOne).toHaveBeenCalledTimes(2);
      expect(Event.updateOne).toHaveBeenCalledWith(
        { _id: 'generatedId_123' },
        { $set: expect.objectContaining({ _id: 'generatedId_123', title: 'Event 1' }) },
        { upsert: true }
      );
    });
  });

  describe('guardarLugares', () => {
    it('should not do anything if places array is empty', async () => {
      await ItemController.guardarLugares([]);
      expect(Place.updateOne).not.toHaveBeenCalled();
    });

    it('should save multiple places', async () => {
      const lugares = [
        { id: '789', title: 'Place 1' },
        { id: '101', title: 'Place 2' }
      ];
      
      Place.updateOne.mockResolvedValue({});
      generateOID.mockImplementationOnce(() => 'generatedId_789')
                 .mockImplementationOnce(() => 'generatedId_101');

      await ItemController.guardarLugares(lugares);

      expect(generateOID).toHaveBeenCalledTimes(2);
      expect(Place.updateOne).toHaveBeenCalledTimes(2);
      expect(Place.updateOne).toHaveBeenCalledWith(
        { _id: 'generatedId_789' },
        { $set: expect.objectContaining({ _id: 'generatedId_789', title: 'Place 1' }) },
        { upsert: true }
      );
    });
  });

  describe('createComment', () => {
    it('should create a basic comment', async () => {
      req.params.id = 'item123';
      req.body = { text: 'Comentario' };
      const newComment = { _id: 'c1', text: 'Comentario' };

      Comment.create.mockResolvedValue(newComment);
      Item.findByIdAndUpdate.mockResolvedValue({});
      User.findByIdAndUpdate.mockResolvedValue({});
      createCreatedResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.createComment(req, res);

      expect(Comment.create).toHaveBeenCalledWith({
        text: 'Comentario',
        user: 'user123',
        event: 'item123'
      });
      expect(Item.findByIdAndUpdate).toHaveBeenCalledWith(
        'item123',
        { $push: { comments: 'c1' } },
        { new: true }
      );
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $push: { comments: 'c1' } },
        { new: true }
      );
      expect(createCreatedResponse).toHaveBeenCalledWith(res, 'Comentario creado exitosamente', newComment);
    });

    it('should create a valoration comment', async () => {
      req.params.id = 'item123';
      req.body = { text: 'Valoración', value: 5 };
      const newValoration = { _id: 'v1', text: 'Valoración', value: 5 };

      Valoration.create.mockResolvedValue(newValoration);
      Item.findByIdAndUpdate.mockResolvedValue({});
      User.findByIdAndUpdate.mockResolvedValue({});
      createCreatedResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.createComment(req, res);

      expect(Valoration.create).toHaveBeenCalledWith({
        text: 'Valoración',
        user: 'user123',
        event: 'item123',
        value: 5
      });
      expect(createCreatedResponse).toHaveBeenCalledWith(res, 'Comentario creado exitosamente', newValoration);
    });

    it('should create a response comment', async () => {
      req.params = { id: 'item123', commentId: 'comment456' };
      req.body = { text: 'Respuesta' };
      const newResponse = { _id: 'r1', text: 'Respuesta', responseTo: 'comment456' };

      Response.create.mockResolvedValue(newResponse);
      Item.findByIdAndUpdate.mockResolvedValue({});
      User.findByIdAndUpdate.mockResolvedValue({});
      createCreatedResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.createComment(req, res);

      expect(Response.create).toHaveBeenCalledWith({
        text: 'Respuesta',
        user: 'user123',
        event: 'item123',
        responseTo: 'comment456'
      });
      expect(createCreatedResponse).toHaveBeenCalledWith(res, 'Comentario creado exitosamente', newResponse);
    });

    it('should prevent creating comment and valoration at once', async () => {
      req.body = { text: 'texto', value: 5 };
      req.params = { id: 'item123', commentId: 'reply123' };
      createBadRequestResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.createComment(req, res);

      expect(createBadRequestResponse).toHaveBeenCalledWith(
        res, 
        'No puedes crear un comentario y una valoración al mismo tiempo'
      );
      expect(Comment.create).not.toHaveBeenCalled();
      expect(Valoration.create).not.toHaveBeenCalled();
      expect(Response.create).not.toHaveBeenCalled();
    });
  });

  describe('getItemComments', () => {
    it('should return comments of an item', async () => {
      req.params.id = 'item1';
      const comments = [{ text: 'Nice!' }];
      const mockEvent = { comments };

      Item.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvent)
      });

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));
    
      await ItemController.getItemComments(req, res);
    
      expect(Item.findOne).toHaveBeenCalledWith({ 
        _id: 'item1', 
        itemType: 'Event' 
      });
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Comentarios obtenidos con éxito', comments);
    });

    it('should return 404 if item not found', async () => {
      req.params.id = 'badId';
      Item.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.getItemComments(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Item no encontrado');
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

      expect(Response.find).toHaveBeenCalledWith({
        responseTo: 'c1',
        event: 'e1',
        deleted: false
      });
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Respuestas obtenidas exitosamente', mockResponses);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment and mark as deleted', async () => {
      req.params = { id: 'eventId', commentId: 'c123' };
      req.userId = 'u1';

      const mockComment = { 
        user: { 
          toString: () => 'u1',
          name: 'Usuario 1',
          email: 'user1@example.com'
        }, 
        text: 'Comentario a eliminar',
        deleted: false,
        save: jest.fn().mockResolvedValue({})
      };
      const mockUser = { _id: 'u1', admin: false };
      const mockEvent = { title: 'Evento de prueba' };

      Comment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockComment)
      });
      User.findById.mockResolvedValue(mockUser);
      Item.findById.mockResolvedValue(mockEvent);
      Response.updateMany.mockResolvedValue({});

      createOkResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.deleteComment(req, res);

      expect(mockComment.deleted).toBe(true);
      expect(mockComment.deleteAt).toBeInstanceOf(Date);
      expect(mockComment.save).toHaveBeenCalled();
      expect(Response.updateMany).toHaveBeenCalledWith(
        { responseTo: 'c123' },
        { 
          $set: { 
            deleted: true,
            deleteAt: expect.any(Date)
          } 
        }
      );
      expect(emailUtils.sendNotification).toHaveBeenCalled();
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Comentario eliminado exitosamente');
    });

    it('should allow admin to delete any comment', async () => {
      req.params = { id: 'eventId', commentId: 'c123' };
      req.userId = 'adminId';

      const mockComment = { 
        user: { 
          toString: () => 'u1', // Un usuario diferente
          name: 'Usuario 1',
          email: 'user1@example.com'
        }, 
        text: 'Comentario a eliminar',
        deleted: false,
        save: jest.fn().mockResolvedValue({})
      };
      const mockUser = { _id: 'adminId', admin: true }; // Admin
      const mockEvent = { title: 'Evento de prueba' };

      Comment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockComment)
      });
      User.findById.mockResolvedValue(mockUser);
      Item.findById.mockResolvedValue(mockEvent);
      Response.updateMany.mockResolvedValue({});

      createOkResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.deleteComment(req, res);

      expect(mockComment.save).toHaveBeenCalled();
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Comentario eliminado exitosamente');
    });

    it('should return 404 if comment not found', async () => {
      req.params = { id: 'eventId', commentId: 'nonexistent' };
      
      Comment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      
      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.deleteComment(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Comentario no encontrado');
    });

    it('should forbid deletion if not owner or admin', async () => {
      req.params = { id: 'eventId', commentId: 'c123' };
      req.userId = 'u1';

      const mockComment = { 
        user: { 
          toString: () => 'u2' // Usuario diferente
        }
      };
      const mockUser = { _id: 'u1', admin: false }; // No es admin

      Comment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockComment)
      });
      User.findById.mockResolvedValue(mockUser);

      createForbiddenResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.deleteComment(req, res);

      expect(createForbiddenResponse).toHaveBeenCalledWith(res, 'No tienes permiso para eliminar este comentario');
    });

    it('should return 404 if event not found', async () => {
      req.params = { id: 'nonexistent', commentId: 'c123' };
      req.userId = 'u1';

      const mockComment = { 
        user: { 
          toString: () => 'u1',
          name: 'Usuario 1',
          email: 'user1@example.com'
        }
      };
      const mockUser = { _id: 'u1', admin: false };

      Comment.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockComment)
      });
      User.findById.mockResolvedValue(mockUser);
      Item.findById.mockResolvedValue(null); // Evento no encontrado

      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      await ItemController.deleteComment(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, 'Evento no encontrado');
    });
  });

  describe('getCategories', () => {
    it('should return Event categories', async () => {
      req.query = { type: 'Event' };
      const categories = ['música', 'teatro'];
      Item.distinct.mockResolvedValue(categories);

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getCategories(req, res);

      expect(Item.distinct).toHaveBeenCalledWith('category', { itemType: 'Event' });
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Categorías obtenidas exitosamente', categories);
    });

    it('should return Place categories', async () => {
      req.query = { type: 'Place' };
      const categories = ['teatro', 'museo', 'sala de exposiciones'];
      Item.distinct.mockResolvedValue(categories);

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await ItemController.getCategories(req, res);

      expect(Item.distinct).toHaveBeenCalledWith('category', { itemType: 'Place' });
      expect(createOkResponse).toHaveBeenCalledWith(res, 'Categorías obtenidas exitosamente', categories);
    });
  });
});
