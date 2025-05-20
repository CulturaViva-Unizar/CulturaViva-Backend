const StatisticsController = require('../../src/controllers/statisticsController');
const { Visit } = require('../../src/models/statisticsModel');
const { filterDate } = require('../../src/utils/statisticsUtils');
const { createOkResponse } = require('../../src/utils/utils');


jest.mock('../../src/models/statisticsModel'); // Mock del modelo Visit
jest.mock('../../src/utils/statisticsUtils');  // Mock de filterDate
jest.mock('../../src/utils/utils');

describe('StatisticsController', () => {
  describe('getVisits', () => {
    let res;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      filterDate.mockClear();
      Visit.aggregate.mockClear();
    });

    it('debe llamar a filterDate con el rango recibido y devolver las estadísticas', async () => {
      const fakePipeline = [{ $match: {} }];
      const fakeStats = [{ id: '2025-05', total: 10 }];
      createOkResponse.mockImplementation((res, msg, data) => 
        res.status(200).json({ msg, data })
      );

      filterDate.mockReturnValue(fakePipeline);
      Visit.aggregate.mockResolvedValue(fakeStats);

      const req = { query: { range: '1m' } };

      await StatisticsController.getVisits(req, res);

      expect(filterDate).toHaveBeenCalledWith('1m');
      expect(Visit.aggregate).toHaveBeenCalledWith(fakePipeline);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: expect.any(String),
          data: expect.objectContaining({ stats: fakeStats })
        })
      );
    });

    it('usa rango por defecto 12m si no se especifica', async () => {
      const fakePipeline = [{ $match: {} }];
      filterDate.mockReturnValue(fakePipeline);
      Visit.aggregate.mockResolvedValue([]);

      const req = { query: {} };

      await StatisticsController.getVisits(req, res);

      expect(filterDate).toHaveBeenCalledWith('12m');
    });
  });
});
