const { User } = require("../models/userModel");
const { Item, Event } = require("../models/eventModel");
const { Comment } = require("../models/commentModel");

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
      const users = await User.find({}).select("-password");
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
      const { name, email, phone } = req.body;
      const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      toObjectId(userId),
      { name, email, phone },
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
    const userId = req.userId;

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
    const paginatedResults = await handlePagination(page, limit, finalQuery, Item);
    return createOkResponse(res, "Items obtenidos exitosamente", paginatedResults);
  }

  /**
   * Obtiene todos los comentarios de un usuario
   */
  async getUserComments(req, res) {
    const userId = req.userId;

      const user = await User.findById(toObjectId(userId));
      if (!user) {
          return createNotFoundResponse(res, "Usuario no encontrado"); 
      }
      const comments = await Comment.find({ user: toObjectId(userId) })
        .sort({ date: -1 });
      if (!comments || comments.length === 0) {
          return createNotFoundResponse(res, "No se encontraron comentarios para este usuario");
      }
      return createOkResponse(res, "Comentarios obtenidos exitosamente", comments);
  }
  /**
   * Guarda un evento en el perfil del usuario
   */
  async saveItem(req, res) {
    const userId = req.userId;
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
  async getAttendingItems(req, res) {
    console.log("Llego!")
    const { name, date, category, page, limit } = req.query;
    const userId = req.userId;

    const filters = {};
    if (name) filters.name = name;
    if (date) filters.date = date;
    if (category) filters.category = category;

    const user = await User.findById(toObjectId(userId));
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }
    const additionalQuery = { _id: { $in: user.asistsTo } };
    const finalQuery = { ...filters, ...additionalQuery };
    const paginatedResults = await handlePagination(page, limit, finalQuery, Event);
    return createOkResponse(res, "Items obtenidos exitosamente", paginatedResults);
  }

  /**
   * Marca como asistiente a un evento
   */
  async attendItem(req, res) {
    const userId = req.userId;
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
    const userId = req.userId;
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
    const userId = req.userId;
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
    const userId = req.userId;
    console.log("User ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      return createNotFoundResponse(res, "Usuario no encontrado");
    }
    return createOkResponse(res, "Chats obtenidos exitosamente", user.chats);
  }

  /**
   * Devuelve los eventos mas populares
   */
  async getPopularEvents(req, res) {
    const { page, limit } = req.query;
    const finalQuery = {};
    const events = await handlePagination(page, limit, finalQuery, Event, { asistentes: "desc" });
    return createOkResponse(res, "Eventos populares obtenidos exitosamente", events);
  }

  /**
   * Devuelve los eventos proximos
   */
  async getUpcomingEvents(req, res) {
    const { page, limit } = req.query;
    const today = new Date();
    const finalQuery = { startDate: { $gte: today } };
    const events = await handlePagination(page, limit, finalQuery, Event, { startDate: "asc" });
    return createOkResponse(res, "Eventos proximos obtenidos exitosamente", events);
  }
}

module.exports = new UserController();
