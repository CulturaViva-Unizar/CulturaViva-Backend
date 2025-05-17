const { User } = require("../models/userModel");
const { Item, Event } = require("../models/eventModel");
const { Comment } = require("../models/commentModel");
const { createChatDTO } = require("../utils/chatUtils");
const { escapeRegExp } = require("../utils/utils");
const { DisableUsers } = require("../models/statisticsModel");
const { buildUserAggregationPipeline, buildAggregationPipeline } = require("../utils/pipelineUtils");

const { 
  toObjectId,
  createForbiddenResponse,
  createInternalServerErrorResponse,
  createOkResponse, 
  createNotFoundResponse,
  handlePagination
 } = require("../utils/utils");
const { create } = require("../models/chatModel");

class UserController {
  /**
   * Comprueba si el usuario es admin
   */
  async checkAdmin(req, res, next) {
      const user = await User.findById(toObjectId(req.userId));
      if (!user.admin) {
        return createForbiddenResponse(res, "Acceso no autorizado al recurso.");
      }
      next();
  }

  /**
   * Comprueba si el usuario es admin o dueño del perfil
   */
  async checkAdminOrUser(req, res, next) {
      if(req.userId.toString() === req.params.id) return next();
      const user = await User.findById(toObjectId(req.userId));
      if(!user) {
        return createInternalServerErrorResponse(res, "Error interno del servidor.");
      }
      if(user.admin) return next();
      return createForbiddenResponse(res, "Acceso no autorizado al recurso.");
  }

  /**
   * Obtiene todos los usuarios
   */
  async getUsers(req, res) {
    const {
      page = 1,
      limit = 10,
      name,
      userType,
      sort = 'comments',
      order = 'desc'
    } = req.query;
  
    const filters = {};
    if (userType) {
      filters.active = userType.toLowerCase() === 'habilitados';
    }
    if (name) {
      filters.name = { $regex: escapeRegExp(name.trim()), $options: 'i' };
    }
  
    const pipeline = buildUserAggregationPipeline(filters, {
      sortField: sort === 'comments' ? 'commentCount' : sort,
      order,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  
    const [users, totalItems] = await Promise.all([
      User.aggregate(pipeline),
      User.countDocuments(filters)
    ]);
  
    const totalPages = Math.ceil(totalItems / limit);
  
    return createOkResponse(res, "Usuarios obtenidos exitosamente", {
      items: users,
      currentPage: parseInt(page, 10),
      totalPages,
      totalItems
    });
  }

  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(req, res) {
    const userId = req.params.id;
    console.log("User ID:", userId);
    const user = await User.findById(toObjectId(userId)).select("-password");
    if (!user) {
        return createNotFoundResponse(res, "Usuario no encontrado");
    }
    return createOkResponse(res, "Usuario obtenido exitosamente", user);
  }

  /**
   * Actualiza todo el perfil del usuario
   */
  async updateProfile(req, res) {
      const { name, email, phone, active, password } = req.body;
      const userId = req.params.id;
  
      // Construir solo los campos que vienen en el body
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (email !== undefined) updateFields.email = email;
      if (phone !== undefined) updateFields.phone = phone;
      if (active !== undefined) updateFields.active = active;
      if (password !== undefined) updateFields.password = password;
  
      const updatedUser = await User.findByIdAndUpdate(
          toObjectId(userId),
          updateFields,
          { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
          return createNotFoundResponse(res, "Usuario no encontrado");
      }

      // Se actualizan estadisticas de usuarios deshabilitados
      const today = new Date().toISOString().split('T')[0];
      if (active === false) {
        await DisableUsers.findOneAndUpdate(
          { date: today },
          { 
            $inc: { count: 1 },
            $addToSet: { users: toObjectId(userId) }
          },
          { 
            upsert: true,
            new: true 
          }
        );
      }
      else if (active === true) {
        await DisableUsers.findOneAndUpdate(
          { users: toObjectId(userId) },
          { 
            $inc: { count: -1 },
            $pull: { users: toObjectId(userId) }
          },
          {
            new: true 
          }
        );
      }

      
      return createOkResponse(res, "Perfil actualizado exitosamente", updatedUser);
  }


  /**
   * Obtiene los items guardados por el usuario
   */
  async getSavedItems(req, res) {
    const {
      name,
      startDate,
      endDate,
      itemType,
      category,
      sort = 'startDate',
      order = 'asc',
      minPrice,
      maxPrice,
      page = 1,
      limit = 16
    } = req.query;

    const userId = req.params.id;
    const user = await User.findById(toObjectId(userId));

    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }

    const filters = {
      _id: { $in: user.savedItems.map(id => toObjectId(id)) }
    };

    if (name) {
      const pattern = escapeRegExp(name.trim());
      filters.title = { $regex: pattern, $options: 'i' };
    }

    if (startDate) {
      filters.startDate = { ...filters.startDate, $gte: new Date(startDate) };
    }

    if (endDate) {
      filters.endDate = { ...filters.endDate, $lte: new Date(endDate) };
    }

    if (category) filters.category = category;
    if (itemType) filters.itemType = itemType;

    const options = {
      sort,
      order,
      minPrice,
      maxPrice,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const pipeline = buildAggregationPipeline(filters, options);
    const items = await Item.aggregate(pipeline);

    return createOkResponse(res, "Items obtenidos exitosamente", items);
  }


  /**
   * Obtiene todos los comentarios de un usuario
   */
  async getUserComments(req, res) {
    const userId = req.params.id;

      const user = await User.findById(toObjectId(userId));
      if (!user) {
          return createNotFoundResponse(res, "Usuario no encontrado"); 
      }

      const comments = await Comment.find({ user: toObjectId(userId) })
        .populate('user', 'name -userType')
        .populate('event', 'title itemType')
        .sort({ date: -1 });
      return createOkResponse(res, "Comentarios obtenidos exitosamente", comments);
  }
  /**
   * Guarda un evento en el perfil del usuario
   */
  async saveItem(req, res) {
    const userId = req.params.id;
    const { eventId } = req.body;

    const user = await User.findById(userId);
    const exists = user.savedItems.some((item) => item.equals(eventId));

    if (!exists) {
      user.savedItems.push(toObjectId(eventId));
      await user.save();
    }

    return createOkResponse(res, "Evento guardado exitosamente", user.savedItems);

  }

  /**
   * Obtiene los eventos a los que el usuario asiste
   */
  async getAttendedItems(req, res) {
    const {
      name,
      category,
      sort = 'startDate',
      order = 'asc',
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    const userId = req.params.id;
    const today = new Date();

    const user = await User.findById(toObjectId(userId));
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }

    const filters = {
      _id: { $in: user.asistsTo.map(id => toObjectId(id)) },
      endDate: { $lt: today }
    };

    if (name) {
      const pattern = escapeRegExp(name.trim());
      filters.title = { $regex: pattern, $options: 'i' };
    }

    if (category) {
      filters.category = category;
    }

    const options = {
      sort,
      order,
      minPrice,
      maxPrice,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const pipeline = buildAggregationPipeline(filters, options);
    const items = await Event.aggregate(pipeline);

    return createOkResponse(res, "Items obtenidos exitosamente", items);
  }


  /**
   * Marca como asistente a un evento
   */
  async attendItem(req, res) {
    const userId = req.params.id;
    const { eventId } = req.body;

    const user = await User.findById(toObjectId(userId));
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }

    const event = await Event.findById(toObjectId(eventId));
    if (!event) {
      return createNotFoundResponse(res, "Evento no encontrado");
    }

    const exists = user.asistsTo.some((item) => item.equals(eventId));
    if (!exists) {
      user.asistsTo.push(toObjectId(eventId));
      event.asistentes.push(toObjectId(userId));
      await Promise.all([user.save(), event.save()]);
    }

    return createOkResponse(res, "Evento marcado como asistente exitosamente", user.asistsTo);
  }

  /**
   * Elimina un evento guardado del perfil del usuario
   */
  async removeSavedItem(req, res) {
    const userId = req.params.id;
    const { eventId } = req.params;

    const user = await User.findById(toObjectId(userId));

    user.savedItems = user.savedItems.filter(item => item.toString() !== eventId);
    await user.save();

    return createOkResponse(res, "Item eliminado de los guardados exitosamente", user.savedItems);
  }

  /**
   * Elimina un evento al que el usuario asiste
   */
  async removeAttendingItem(req, res) {
    const userId = req.params.id;
    const { eventId } = req.params;
    const user = await User.findById(toObjectId(userId));
    user.asistsTo = user.asistsTo.filter(item => item.toString() !== eventId);
    const event = await Event.findById(toObjectId(eventId));
    event.asistentes = event.asistentes.filter(user => user.toString() !== userId);
    await Promise.all([user.save(), event.save()]);
    return createOkResponse(res, "Evento eliminado de los asistidos exitosamente", user.asistsTo);
  }

  /**
   * Devuelve todos los chats en los que participa el usuario
   */
  async getUserChats(req, res) {
    const userId = req.params.id;
    console.log("User ID:", userId);
    const user = await User.findById(userId).populate('chats');
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }

    const chatsDTO = await Promise.all(
      user.chats.map(chat => createChatDTO(chat, userId))
    );

    return createOkResponse(res, "Chats obtenidos exitosamente", chatsDTO);
  }

  /**
   * Devuelve los eventos mas populares
   */
  async getPopularEvents(req, res) {
    const { page, limit, category } = req.query;
    let filters = {};
    if (category) {
      filters.category = category;
    }
    const today = new Date();
    const dateFilter = { endDate: { $gte: today } };
    const finalQuery = { ...filters, ...dateFilter };
    const sortCondition = { asistentes: -1 };
    const events = await handlePagination(page, limit, finalQuery, Event, sortCondition);
    return createOkResponse(res, "Eventos populares obtenidos exitosamente", events);
  }

  /**
   * Devuelve los eventos proximos
   */
  async getUpcomingEvents(req, res) {
    const { page, limit, category } = req.query;
    const userId = req.params.id;
    const user = await User.findById(toObjectId(userId));
    let filters = {};
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }
    
    if (category) {
      filters.category = category;
    }
    const today = new Date();
    const dateFilter = { endDate: { $gte: today } };
    const asistFilter = { _id: { $in: user.asistsTo } };
    const finalQuery = { ...filters, ...asistFilter, ...dateFilter };
    const orderCondition = { startDate: 1 };
    const events = await handlePagination(page, limit, finalQuery, Event, orderCondition);
    return createOkResponse(res, "Eventos proximos obtenidos exitosamente", events);
  }

  /**
   * Promueve a un usuario a administrador
   */
  async makeAdmin(req, res) {
    const userId = req.params.id;
    
    const updatedUser = await User.findByIdAndUpdate(
        toObjectId(userId),
        { admin: true },
        { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
        return createNotFoundResponse(res, "Usuario no encontrado");
    }

    return createOkResponse(res, "Usuario promovido a administrador exitosamente", updatedUser);
  }
}

module.exports = new UserController();
