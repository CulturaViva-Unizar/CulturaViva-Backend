const { User } = require("../models/userModel");
const { Item } = require("../models/eventModel");

const { createOkResponse } = require("../utils/utils");

class StatisticsController {
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

  async eventCount(req, res) {
    let count = 0;

    const match = {};
    if (req.query.type) match.category = req.query.type;

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
}

module.exports = new StatisticsController();
