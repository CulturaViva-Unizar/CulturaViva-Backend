const StatisticsController = require('../../src/controllers/statisticsController');
const { User } = require('../../src/models/userModel');
const { Item } = require('../../src/models/eventModel');
const { Comment } = require('../../src/models/commentModel');
const { Visit, DisableUsers, SavedItemsStats } = require('../../src/models/statisticsModel');

const {
  toObjectId,
  createOkResponse,
  createInternalServerErrorResponse,
  createNotFoundResponse,
} = require('../../src/utils/utils');

const { filterDate } = require('../../src/utils/statisticsUtils');

jest.mock('../../src/models/userModel');
jest.mock('../../src/models/eventModel');
jest.mock('../../src/models/commentModel');
jest.mock('../../src/models/statisticsModel');
jest.mock('../../src/utils/utils');
jest.mock('../../src/utils/statisticsUtils');

describe('StatisticsController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { query: {}, params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
    };
    next = jest.fn();

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('countVisits', () => {
    it('should create new Visit if none exists and call next', async () => {
      Visit.findOne.mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(true);
      Visit.mockImplementation(() => ({ save: saveMock }));

      await StatisticsController.countVisits(req, res, next);

      expect(Visit.findOne).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should increment count if Visit exists and call next', async () => {
      const visit = { count: 5, save: jest.fn().mockResolvedValue(true) };
      Visit.findOne.mockResolvedValue(visit);

      await StatisticsController.countVisits(req, res, next);

      expect(visit.count).toBe(6);
      expect(visit.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getVisits', () => {
    it('should get visits with filterDate pipeline and respond', async () => {
      const fakeStats = [{ date: '2023-01', count: 10 }];
      req.query.range = '6m';
      filterDate.mockReturnValue(['pipeline']);
      Visit.aggregate.mockResolvedValue(fakeStats);

      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.getVisits(req, res);

      expect(filterDate).toHaveBeenCalledWith('6m');
      expect(Visit.aggregate).toHaveBeenCalledWith(['pipeline']);
      expect(createOkResponse).toHaveBeenCalledWith(res, "Visitas obtenidas exitosamente", { stats: fakeStats });
      expect(res.json).toHaveBeenCalledWith({
        msg: "Visitas obtenidas exitosamente",
        data: { stats: fakeStats },
      });
    });
  });

  describe('userCount', () => {
    it('should count all users by default', async () => {
      User.countDocuments.mockResolvedValue(42);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.userCount(req, res);

      expect(User.countDocuments).toHaveBeenCalledWith();
      expect(createOkResponse).toHaveBeenCalledWith(res, expect.any(String), { count: 42 });
      expect(res.json).toHaveBeenCalledWith({ msg: expect.any(String), data: { count: 42 } });
    });

    it('should count active users when type=activos', async () => {
      req.query.type = 'activos';
      User.countDocuments.mockResolvedValue(10);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.userCount(req, res);

      expect(User.countDocuments).toHaveBeenCalledWith({ active: true });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: { count: 10 },
      }));
    });

    it('should count inactive users when type=inactivos', async () => {
      req.query.type = 'inactivos';
      User.countDocuments.mockResolvedValue(5);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.userCount(req, res);

      expect(User.countDocuments).toHaveBeenCalledWith({ active: false });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: { count: 5 },
      }));
    });
  });

  describe('eventCount', () => {
    it('should count events starting now or later, with category filter', async () => {
      req.query.category = 'music';
      const count = 7;
      Item.countDocuments.mockResolvedValue(count);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.eventCount(req, res);

      expect(Item.countDocuments).toHaveBeenCalledWith(expect.objectContaining({
        category: 'music',
        startDate: expect.any(Object),
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: { count },
      }));
    });

    it('should count events without category filter', async () => {
      const count = 3;
      Item.countDocuments.mockResolvedValue(count);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.eventCount(req, res);

      expect(Item.countDocuments).toHaveBeenCalledWith(expect.objectContaining({
        startDate: expect.any(Object),
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: { count },
      }));
    });
  });

  describe('getDisableUsersCount', () => {
    it('should aggregate disable users stats and respond', async () => {
      req.query.range = '3m';
      const stats = [{ month: '2025-01', count: 2 }];
      filterDate.mockReturnValue(['pipeline']);
      DisableUsers.aggregate.mockResolvedValue(stats);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.getDisableUsersCount(req, res);

      expect(filterDate).toHaveBeenCalledWith('3m');
      expect(DisableUsers.aggregate).toHaveBeenCalledWith(['pipeline']);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: { stats },
      }));
    });
  });

  describe('initializeVisits', () => {
    it('should bulkWrite visits and respond success', async () => {
      const bulkWriteMock = jest.fn().mockResolvedValue(true);
      Visit.bulkWrite = bulkWriteMock;
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.initializeVisits(req, res);

      expect(bulkWriteMock).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: expect.stringContaining('Visitas inicializadas'),
        data: expect.objectContaining({ daysInitialized: expect.any(Number) }),
      }));
    });

    it('should handle errors and respond with internal server error', async () => {
      const error = new Error('fail');
      Visit.bulkWrite = jest.fn().mockRejectedValue(error);
      createInternalServerErrorResponse.mockImplementation((res, msg) => res.json({ error: msg }));

      await StatisticsController.initializeVisits(req, res);

      expect(createInternalServerErrorResponse).toHaveBeenCalledWith(res, expect.any(String));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(String),
      }));
    });
  });

  describe('assistedEventsByCategory', () => {
    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      req.params.id = '123';

      await StatisticsController.assistedEventsByCategory(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, "Usuario no encontrado");
      expect(res.json).toHaveBeenCalledWith({ msg: "Usuario no encontrado" });
    });

    it('should aggregate events and return success', async () => {
      const user = { asistsTo: ['id1', 'id2'] };
      const result = [{ category: 'sports', count: 2 }];

      User.findById.mockResolvedValue(user);
      Item.aggregate.mockResolvedValue(result);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      req.params.id = '123';

      await StatisticsController.assistedEventsByCategory(req, res);

      expect(Item.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        msg: "Conteo de eventos asistidos por categoría obtenido exitosamente",
        data: result,
      });
    });
  });

  describe('eventsByCategory', () => {
    it('should aggregate upcoming events and respond', async () => {
      const result = [{ category: 'music', count: 5 }];
      Item.aggregate.mockResolvedValue(result);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.eventsByCategory(req, res);

      expect(Item.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        msg: "Conteo de eventos por categoría obtenido exitosamente",
        data: result,
      });
    });
  });

  describe('upcomingByCategory', () => {
    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);
      createNotFoundResponse.mockImplementation((res, msg) => res.json({ msg }));

      req.params.id = 'abc';

      await StatisticsController.upcomingByCategory(req, res);

      expect(createNotFoundResponse).toHaveBeenCalledWith(res, "Usuario no encontrado");
      expect(res.json).toHaveBeenCalledWith({ msg: "Usuario no encontrado" });
    });

    it('should aggregate upcoming events and respond', async () => {
      const user = { asistsTo: ['id1', 'id2'] };
      const result = [{ category: 'tech', count: 3 }];

      User.findById.mockResolvedValue(user);
      Item.aggregate.mockResolvedValue(result);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      req.params.id = 'abc';

      await StatisticsController.upcomingByCategory(req, res);

      expect(Item.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        msg: "Conteo de próximos eventos por categoría obtenido exitosamente",
        data: result,
      });
    });
  });

  describe('getSavedEventCount', () => {
    it('should aggregate saved items stats and respond', async () => {
      req.query.range = '1m';
      const stats = [{ month: '2025-04', count: 15 }];
      filterDate.mockReturnValue(['pipeline']);
      SavedItemsStats.aggregate.mockResolvedValue(stats);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      await StatisticsController.getSavedEventCount(req, res);

      expect(filterDate).toHaveBeenCalledWith('1m');
      expect(SavedItemsStats.aggregate).toHaveBeenCalledWith(['pipeline']);
      expect(res.json).toHaveBeenCalledWith({
        msg: "Coneto de eventos obtenido exitosamente",
        data: { stats },
      });
    });
  });

  describe('getCommentsStatistics', () => {
    it('should compute comments stats and respond', async () => {
      const result = [{ totalAdded: 5, totalEliminated: 2 }];
      Comment.aggregate.mockResolvedValue(result);
      createOkResponse.mockImplementation((res, msg, data) => res.json({ msg, data }));

      req.query.range = '1w';

      await StatisticsController.getCommentsStatistics(req, res);

      expect(Comment.aggregate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        msg: "Estadísticas de comentarios obtenidas exitosamente",
        data: result,
      });
    });
  });

});
