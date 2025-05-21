const StatisticsController = require('../../src/controllers/statisticsController');
const { Visit, DisableUsers, SavedItemsStats } = require('../../src/models/statisticsModel');
const { User } = require('../../src/models/userModel');
const { Item, Event, Place } = require('../../src/models/eventModel');
const { Comment } = require('../../src/models/commentModel');
const { filterDate } = require('../../src/utils/statisticsUtils');
const { toObjectId, createOkResponse, createNotFoundResponse } = require('../../src/utils/utils');

// Mocks
jest.mock('../../src/models/statisticsModel');
jest.mock('../../src/models/userModel');
jest.mock('../../src/models/eventModel');
jest.mock('../../src/models/commentModel');
jest.mock('../../src/utils/statisticsUtils');
jest.mock('../../src/utils/utils');
jest.mock('../../src/logger/logger.js');

describe('StatisticsController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();

    // Configuración predeterminada para createOkResponse y createNotFoundResponse
    createOkResponse.mockImplementation((res, msg, data) => 
      res.status(200).json({ msg, data })
    );
    createNotFoundResponse.mockImplementation((res, msg) => 
      res.status(404).json({ success: false, message: msg })
    );
    toObjectId.mockImplementation(id => id);
  });
  
  describe('countVisits', () => {
    it('debe incrementar contador si ya existe un registro para hoy', async () => {
      const today = new Date().toISOString().split('T')[0];
      const existingVisit = { date: today, count: 5, save: jest.fn().mockResolvedValue(true) };
      Visit.findOne.mockResolvedValue(existingVisit);
      
      await StatisticsController.countVisits(req, res, next);
      
      expect(Visit.findOne).toHaveBeenCalledWith({ date: today });
      expect(existingVisit.count).toBe(6); // Se incrementó en uno
      expect(existingVisit.save).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
    
    it('debe crear un nuevo registro si no existe para hoy', async () => {
      const today = new Date().toISOString().split('T')[0];
      Visit.findOne.mockResolvedValue(null);
      
      // Mock para el constructor y el método save
      const mockSave = jest.fn().mockResolvedValue(true);
      Visit.mockImplementation(() => {
        return { save: mockSave };
      });
      
      await StatisticsController.countVisits(req, res, next);
      
      expect(Visit.findOne).toHaveBeenCalledWith({ date: today });
      expect(Visit).toHaveBeenCalledWith({ date: today, count: 1 });
      expect(mockSave).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getVisits', () => {
    it('debe llamar a filterDate con el rango recibido y devolver las estadísticas', async () => {
      const fakePipeline = [{ $match: {} }];
      const fakeStats = [{ id: '2025-05', total: 10 }];
      filterDate.mockReturnValue(fakePipeline);
      Visit.aggregate.mockResolvedValue(fakeStats);

      req.query.range = '1m';

      await StatisticsController.getVisits(req, res);

      expect(filterDate).toHaveBeenCalledWith('1m');
      expect(Visit.aggregate).toHaveBeenCalledWith(fakePipeline);
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Visitas obtenidas exitosamente",
        { stats: fakeStats }
      );
    });

    it('usa rango por defecto 12m si no se especifica', async () => {
      const fakePipeline = [{ $match: {} }];
      filterDate.mockReturnValue(fakePipeline);
      Visit.aggregate.mockResolvedValue([]);

      await StatisticsController.getVisits(req, res);

      expect(filterDate).toHaveBeenCalledWith('12m');
    });
  });
  
  describe('userCount', () => {
    it('debe devolver el conteo total de usuarios cuando no se especifica tipo', async () => {
      User.countDocuments.mockResolvedValue(100);
      
      await StatisticsController.userCount(req, res);
      
      expect(User.countDocuments).toHaveBeenCalledWith();
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de usuarios obtenido exitosamente",
        { count: 100 }
      );
    });
    
    it('debe devolver solo usuarios activos cuando type=activos', async () => {
      User.countDocuments.mockResolvedValue(75);
      req.query.type = "activos";
      
      await StatisticsController.userCount(req, res);
      
      expect(User.countDocuments).toHaveBeenCalledWith({ active: true });
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de usuarios obtenido exitosamente",
        { count: 75 }
      );
    });
    
    it('debe devolver solo usuarios inactivos cuando type=inactivos', async () => {
      User.countDocuments.mockResolvedValue(25);
      req.query.type = "inactivos";
      
      await StatisticsController.userCount(req, res);
      
      expect(User.countDocuments).toHaveBeenCalledWith({ active: false });
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de usuarios obtenido exitosamente",
        { count: 25 }
      );
    });
  });
  
  describe('eventCount', () => {
    it('debe devolver el conteo de eventos futuros', async () => {
      Item.countDocuments.mockResolvedValue(42);
      
      await StatisticsController.eventCount(req, res);
      
      expect(Item.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Object)
        })
      );
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de eventos obtenido exitosamente",
        { count: 42 }
      );
    });
    
    it('debe filtrar por categoría si se especifica', async () => {
      Item.countDocuments.mockResolvedValue(15);
      req.query.category = "música";
      
      await StatisticsController.eventCount(req, res);
      
      expect(Item.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Object),
          category: "música"
        })
      );
    });
  });
  
  describe('getDisableUsersCount', () => {
    it('debe usar filterDate y devolver estadísticas correctas', async () => {
      const fakePipeline = [{ $match: {} }];
      const fakeStats = [{ id: '2025-05', total: 3 }];
      
      filterDate.mockReturnValue(fakePipeline);
      DisableUsers.aggregate.mockResolvedValue(fakeStats);
      req.query.range = '6m';
      
      await StatisticsController.getDisableUsersCount(req, res);
      
      expect(filterDate).toHaveBeenCalledWith('6m');
      expect(DisableUsers.aggregate).toHaveBeenCalledWith(fakePipeline);
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de usuarios deshabilitados obtenido exitosamente",
        { stats: fakeStats }
      );
    });
    
    it('usa rango por defecto 12m si no se especifica', async () => {
      const fakePipeline = [{ $match: {} }];
      filterDate.mockReturnValue(fakePipeline);
      DisableUsers.aggregate.mockResolvedValue([]);
      
      await StatisticsController.getDisableUsersCount(req, res);
      
      expect(filterDate).toHaveBeenCalledWith('12m');
    });
  });
  
  describe('initializeVisits', () => {
    it('debe devolver el número correcto de días inicializados', async () => {
      // Para esta prueba solo verificamos que devuelve la respuesta correcta
      // sin ejecutar realmente las operaciones bulkWrite
      
      await StatisticsController.initializeVisits(req, res);
      
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Visitas inicializadas exitosamente",
        expect.objectContaining({
          daysInitialized: expect.any(Number)
        })
      );
      
      // Verificar que es aproximadamente 365 días (un año)
      const responseData = createOkResponse.mock.calls[0][2];
      expect(responseData.daysInitialized).toBeGreaterThanOrEqual(365);
      expect(responseData.daysInitialized).toBeLessThanOrEqual(366); // Años bisiestos
    });
  });
  
  describe('assistedEventsByCategory', () => {
    it('debe devolver eventos agrupados por categoría para un usuario', async () => {
      const userId = 'userId123';
      const mockUser = { _id: userId };
      const mockAggregateResult = [
        { category: 'música', count: 5 },
        { category: 'teatro', count: 3 }
      ];
      
      req.params.id = userId;
      User.findById.mockResolvedValue(mockUser);
      Event.aggregate.mockResolvedValue(mockAggregateResult);
      
      await StatisticsController.assistedEventsByCategory(req, res);
      
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Event.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ $match: expect.any(Object) }),
          expect.objectContaining({ $group: expect.any(Object) }),
          expect.objectContaining({ $project: expect.any(Object) })
        ])
      );
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de eventos asistidos por categoría obtenido exitosamente",
        mockAggregateResult
      );
    });
    
    it('debe devolver 404 si el usuario no existe', async () => {
      const userId = 'nonexistentUser';
      req.params.id = userId;
      User.findById.mockResolvedValue(null);
      
      await StatisticsController.assistedEventsByCategory(req, res);
      
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(createNotFoundResponse).toHaveBeenCalledWith(res, "Usuario no encontrado");
      expect(Event.aggregate).not.toHaveBeenCalled();
    });
  });
  
  describe('popularByCategory', () => {
    it('debe devolver eventos populares agrupados por categoría', async () => {
      const mockAggregateResult = [
        { category: 'música', count: 20 },
        { category: 'teatro', count: 15 }
      ];
      
      Event.aggregate.mockResolvedValue(mockAggregateResult);
      
      await StatisticsController.popularByCategory(req, res);
      
      expect(Event.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ $match: expect.any(Object) }),
          expect.objectContaining({ $group: expect.any(Object) }),
          expect.objectContaining({ $project: expect.any(Object) })
        ])
      );
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de eventos por categoría obtenido exitosamente",
        mockAggregateResult
      );
    });
    
    it('debe usar Place cuando itemType=Place', async () => {
      const mockAggregateResult = [
        { category: 'museos', count: 8 },
        { category: 'centros culturales', count: 5 }
      ];
      
      req.query.itemType = 'Place';
      Place.aggregate.mockResolvedValue(mockAggregateResult);
      
      await StatisticsController.popularByCategory(req, res);
      
      // Para Place no debe incluir el filtro de startDate en el pipeline
      expect(Place.aggregate).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({ 
            $match: expect.objectContaining({ startDate: expect.any(Object) }) 
          })
        ])
      );
    });
  });
  
  describe('upcomingByCategory', () => {
    it('debe devolver próximos eventos agrupados por categoría para un usuario', async () => {
      const userId = 'userId123';
      const mockUser = { _id: userId };
      const mockAggregateResult = [
        { category: 'música', count: 2 },
        { category: 'teatro', count: 1 }
      ];
      
      req.params.id = userId;
      User.findById.mockResolvedValue(mockUser);
      Event.aggregate.mockResolvedValue(mockAggregateResult);
      
      await StatisticsController.upcomingByCategory(req, res);
      
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(Event.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ 
            $match: expect.objectContaining({ 
              startDate: expect.any(Object) // Verifica que filtra por eventos futuros
            }) 
          }),
          expect.objectContaining({ $group: expect.any(Object) }),
          expect.objectContaining({ $project: expect.any(Object) })
        ])
      );
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Conteo de próximos eventos por categoría obtenido exitosamente",
        mockAggregateResult
      );
    });
    
    it('debe devolver 404 si el usuario no existe', async () => {
      const userId = 'nonexistentUser';
      req.params.id = userId;
      User.findById.mockResolvedValue(null);
      
      await StatisticsController.upcomingByCategory(req, res);
      
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(createNotFoundResponse).toHaveBeenCalledWith(res, "Usuario no encontrado");
      expect(Event.aggregate).not.toHaveBeenCalled();
    });
  });
  
  describe('getSavedEventCount', () => {
    it('debe usar filterDate y devolver estadísticas correctas', async () => {
      const fakePipeline = [{ $match: {} }];
      const fakeStats = [{ id: '2025-05', total: 8 }];
      
      filterDate.mockReturnValue(fakePipeline);
      SavedItemsStats.aggregate.mockResolvedValue(fakeStats);
      req.query.range = '3m';
      
      await StatisticsController.getSavedEventCount(req, res);
      
      expect(filterDate).toHaveBeenCalledWith('3m');
      expect(SavedItemsStats.aggregate).toHaveBeenCalledWith(fakePipeline);
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Coneto de eventos obtenido exitosamente",
        { stats: fakeStats }
      );
    });
    
    it('usa rango por defecto 12m si no se especifica', async () => {
      const fakePipeline = [{ $match: {} }];
      filterDate.mockReturnValue(fakePipeline);
      SavedItemsStats.aggregate.mockResolvedValue([]);
      
      await StatisticsController.getSavedEventCount(req, res);
      
      expect(filterDate).toHaveBeenCalledWith('12m');
    });
  });
  
  describe('getCommentsStatistics', () => {
    it('debe devolver estadísticas de comentarios para el rango especificado', async () => {
      const mockResult = [
        { totalEliminated: 5, totalAdded: 25 }
      ];
      
      Comment.aggregate.mockResolvedValue(mockResult);
      req.query.range = '6m';
      
      await StatisticsController.getCommentsStatistics(req, res);
      
      expect(Comment.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ $match: expect.any(Object) }),
          expect.objectContaining({ $group: expect.any(Object) }),
          expect.objectContaining({ $project: expect.any(Object) })
        ])
      );
      expect(createOkResponse).toHaveBeenCalledWith(
        res,
        "Estadísticas de comentarios obtenidas exitosamente",
        mockResult
      );
    });
    
    it('debe usar un rango por defecto si no se especifica', async () => {
      Comment.aggregate.mockResolvedValue([]);
      
      await StatisticsController.getCommentsStatistics(req, res);
      
      // Verificar que aggregate fue llamado (no nos interesa el valor específico del rango)
      expect(Comment.aggregate).toHaveBeenCalled();
    });
    
    it('debe manejar diferentes rangos de fechas correctamente', async () => {
      const testCases = [
        { range: '1w', expectedResult: true },
        { range: '1m', expectedResult: true },
        { range: '3m', expectedResult: true },
        { range: '6m', expectedResult: true },
        { range: '9m', expectedResult: true },
        { range: '12m', expectedResult: true },
        { range: 'invalid', expectedResult: true } // Debería usar el default (12m)
      ];
      
      for (const testCase of testCases) {
        jest.clearAllMocks();
        Comment.aggregate.mockResolvedValue([]);
        req.query.range = testCase.range;
        
        await StatisticsController.getCommentsStatistics(req, res);
        
        expect(Comment.aggregate).toHaveBeenCalled();
        expect(createOkResponse).toHaveBeenCalled();
      }
    });
  });
});
