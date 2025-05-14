const { User } = require("../models/userModel");
const { Item } = require("../models/eventModel");
const { Visit } = require("../models/statisticsModel");

const { createOkResponse, createInternalServerErrorResponse } = require("../utils/utils");

class StatisticsController {

  /**
   * Middleware para contar visitas
  */
  async countVisits(req, res, next) {
      const today = new Date().toISOString().split('T')[0];
      let visit = await Visit.findOne({ date: today });
      if (!visit) {
        visit = new Visit({ date: today, count: 1 });
      } else {
        visit.count++;
      }
      await visit.save();
      next();
    }
  
  /**
   * Obtiene las visitas por meses
  */
  async getVisits(req, res) {
    const range = req.query.range || '12';
    const today = new Date();
    let startDate = new Date();

    switch (range) {
      case '1':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '12':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(today.getFullYear() - 1);
    }

    const from = startDate.toISOString().split('T')[0];
    const stats = await Visit.aggregate([
      {
        $match: {
          date: { $gte: from }
        }
      },
      {
        $group: {
          _id: {
            year: { $substr: ['$date', 0, 4] },
            month: { $substr: ['$date', 5, 2] }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { 
          "_id.year": 1,
          "_id.month": 1 
        }
      },
      {
        $project: {
          _id: {
            $concat: ["$_id.year", "-", "$_id.month"]
          },
          total: 1
        }
      }
    ]);

    const monthlyVisits = {};
    stats.forEach(stat => {
      monthlyVisits[stat._id] = stat.total;
    });

    return createOkResponse(res, "Visitas obtenidas exitosamente", {
      months: stats
    });
  }

  /**
   * Obtiene el conteo de usuarios
   */
  async userCount(req, res) {
    let count = 0;

    switch (req.query.type) {
      case "activos":
        count = await User.countDocuments({ active: true });
        break;
      case "inactivos":
        count = await User.countDocuments({ active: false });
        break;
      default:
        count = await User.countDocuments();
        break;
    }

    createOkResponse(res, "Conteo de usuarios obtenido exitosamente", {
      count: count,
    });
  }

  /**
   * Obtiene el conteo de eventos
   */
  async eventCount(req, res) {
    let count = 0;
    let match = {};
    if (req.query.category) {
      match = { category: req.query.category };
    }
    count = await Item.countDocuments(match);
    createOkResponse(res, "Conteo de eventos obtenido exitosamente", {
      count: count,
    });
  }

  async assistedEvents(req, res) {
    const userId = req.params.id;

    // const result = await Event.aggregate([
    //     {
    //         $match: { asistentes: toObjectId(userId) }
    //     },
    //     {
    //         $group: {
    //             _id: "$category",
    //             count: { $sum: 1 }
    //         }
    //     }
    // ]);

    const matchStage = { asistentes: toObjectId(userId) };

    if (req.query.type) matchStage.category = req.query.category;

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
    ];
    const result = await Item.aggregate(pipeline);
    const status = res.statusCode !== 200 ? res.statusCode : 200;
    createResponse(
      res,
      status,
      "Conteo de eventos por categoría obtenido exitosamente",
      result
    );
  }

  async initializeVisits(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1); // Empezar desde hace 1 año
      const monthlyVisits = [];

      for (let date = new Date(startDate); date <= today; date.setMonth(date.getMonth() + 1)) {
        const formattedDate = date.toISOString().split('T')[0].substring(0, 7) + '-01'; // Format: YYYY-MM-01
        monthlyVisits.push({
          date: formattedDate,
          count: 0
        });
      }

      const operations = monthlyVisits.map(visit => ({
        updateOne: {
          filter: { date: visit.date },
          update: { $setOnInsert: { count: 0 } },
          upsert: true
        }
      }));

      await Visit.bulkWrite(operations);

      return createOkResponse(res, "Visitas inicializadas exitosamente", {
        monthsInitialized: monthlyVisits.length
      });
    } catch (error) {
      console.error('Error al inicializar visitas:', error);
      return createInternalServerErrorResponse(res, "Error al inicializar las visitas");
    }
  }
}

module.exports = new StatisticsController();
