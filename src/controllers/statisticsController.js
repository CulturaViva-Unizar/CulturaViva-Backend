const { User } = require("../models/userModel");
const { Item } = require("../models/eventModel");
const { Comment } = require("../models/commentModel")
const { Visit, DisableUsers, SavedItemsStats } = require("../models/statisticsModel");

const { toObjectId, createOkResponse, createInternalServerErrorResponse, createNotFoundResponse } = require("../utils/utils");
const { filterDate } = require("../utils/statisticsUtils")
const logger = require("../logger/logger.js");

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
    const range = req.query.range || '12m';
    const pipeline = filterDate(range)
    const stats = await Visit.aggregate(pipeline)
    return createOkResponse(res, "Visitas obtenidas exitosamente", {
      stats
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
    const now = new Date();
    const match = { startDate: { $gte: now } };
    if (req.query.category) {
      match.category = req.query.category;
    }
    const count = await Item.countDocuments(match);
    return createOkResponse(res, "Conteo de eventos obtenido exitosamente", { count });
  }

  /**
   * Obtiene el numero de usuarios deshabilitados a lo largo del tiempo
   */
  async getDisableUsersCount(req, res) {
    const range = req.query.range || '12m';
    const pipeline = filterDate(range)
    const stats = await DisableUsers.aggregate(pipeline)
    return createOkResponse(res, "Conteo de usuarios deshabilitados obtenido exitosamente", {
      stats
    });
  }


  async initializeVisits(req, res) {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      const dailyVisits = [];

      for (let date = new Date(startDate); date <= today; date.setDate(date.getDate() + 1)) {
        const formattedDate = date.toISOString().split('T')[0];
        dailyVisits.push({
          date: formattedDate,
          count: 0
        });
      }

      const operations = dailyVisits.map(visit => ({
        updateOne: {
          filter: { date: visit.date },
          update: { $setOnInsert: { count: 0 } },
          upsert: true
        }
      }));

      await Visit.bulkWrite(operations);

      return createOkResponse(res, "Visitas inicializadas exitosamente", {
        daysInitialized: dailyVisits.length
      });
    } catch (error) {
      logger.error('Error al inicializar visitas', {
        message: error.message,
        stack: error.stack,
      });
      return createInternalServerErrorResponse(res, "Error al inicializar las visitas");
    }
  }

  async assistedEventsByCategory(req, res) {
    const userId = req.params.id;
    const user = await User.findById(toObjectId(userId));
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }
    const now = new Date();
    const pipeline = [
      { $match: { _id: { $in: user.asistsTo }, endDate: { $lt: now } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } }
    ];
    const result = await Item.aggregate(pipeline);
    return createOkResponse(res, "Conteo de eventos asistidos por categoría obtenido exitosamente", result);
  }

  async eventsByCategory(req, res) {
    const now = new Date();
    const pipeline = [
      { $match: { startDate: { $gte: now } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } }
    ];
    const result = await Item.aggregate(pipeline);
    return createOkResponse(res, "Conteo de eventos por categoría obtenido exitosamente", result);
  }

  async upcomingByCategory(req, res) {
    const userId = req.params.id;
    const user = await User.findById(toObjectId(userId));
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }
    const now = new Date();
    const pipeline = [
      { $match: { _id: { $in: user.asistsTo }, startDate: { $gte: now } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } }
    ];
    const result = await Item.aggregate(pipeline);
    return createOkResponse(res, "Conteo de próximos eventos por categoría obtenido exitosamente", result);
  }

  async getSavedEventCount(req, res){
    const range = req.query.range || '12m';
    const pipeline = filterDate(range)
    const stats = await SavedItemsStats.aggregate(pipeline)
    return createOkResponse(res, "Coneto de eventos obtenido exitosamente", {
      stats
    });
  }

  async getCommentsStatistics(req, res) {
    const range = req.query.range || '12m';

    let startDate = new Date();
    const today = new Date();

    switch (range) {
      case '1w':
        startDate.setDate(today.getDate() - 7);
         break;
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case '9m':
        startDate.setMonth(today.getMonth() - 9);
        break;
      case '12m':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(today.getFullYear() - 1);
    } 

      const pipeline = [
        {
          $match: {
            $or: [
              { date:     { $gte: startDate } },
              { deleteAt: { $gte: startDate } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            totalEliminated: {
              $sum: { $cond: [{ $eq: [ "$deleted", true ] }, 1, 0 ] }
            },
            totalAdded: {
              $sum: { $cond: [{ $eq: [ "$deleted", false ] }, 1, 0 ] }
            }
          }
        },
        {
          $project: { _id: 0, totalEliminated: 1, totalAdded: 1 }
        }
      ];


      const result = await Comment.aggregate(pipeline);

      console.log(result)

      return createOkResponse(res, "Estadísticas de comentarios obtenidas exitosamente", result);
  }
}

module.exports = new StatisticsController();
