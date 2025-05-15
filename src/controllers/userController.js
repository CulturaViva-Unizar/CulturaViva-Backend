const { User } = require("../models/userModel");
const { Item, Event } = require("../models/eventModel");
const { Comment } = require("../models/commentModel");
const { createChatDTO } = require("../utils/chatUtils");

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
      const { page, limit, name } = req.query;
      let filters = {};
      if (req.query.userType) {
        filters.active = req.query.userType == "Habilitados" ? true : false;
      }

      if(name) filters.name = { $regex: name, $options: "i" };

      const finalQuery = { ...filters };
      const selectCondition = { password: 0 };
      const orderCondition = { name: 1 };
      const users = await handlePagination(page, limit, finalQuery, User, orderCondition, selectCondition);
      
      return createOkResponse(res, "Usuarios obtenidos exitosamente", users);
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
  
      return createOkResponse(res, "Perfil actualizado exitosamente", updatedUser);
  }


  /**
   * Obtiene los items guardados por el usuario
   */
  async getSavedItems(req, res) {
    const { name, date, category, page, limit } = req.query;
    const userId = req.params.id;

    const filters = {};
    if (name) filters.name = name;
    if (date) filters.date = date;
    if (category) filters.category = category;

    const user = await User.findById(toObjectId(userId));
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }

    const additionalQuery = { _id: { $in: user.savedItems } };
    const finalQuery = { ...filters, ...additionalQuery };
    const sortCondition = { startDate: 1 };
    const paginatedResults = await handlePagination(page, limit, finalQuery, Item, sortCondition);
    return createOkResponse(res, "Items obtenidos exitosamente", paginatedResults);
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
    const { name, category, page, limit } = req.query;
    const userId = req.params.id;
    const today = new Date();

    let filters = {};
    if (category) {
      filters.category = category;
    }

    const user = await User.findById(toObjectId(userId));
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }
    const dateFilter = { endDate: { $lt: today } };
    const asistFilter = { _id: { $in: user.asistsTo } };
    const finalQuery = { ...filters, ...asistFilter, ...dateFilter };
    const orderCondition = { startDate: 1 };
    const paginatedResults = await handlePagination(page, limit, finalQuery, Event, orderCondition);
    return createOkResponse(res, "Items obtenidos exitosamente", paginatedResults);
  }

  /**
   * Marca como asistiente a un evento
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
    
    const finalQuery = { ...filters };
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
}

module.exports = new UserController();
