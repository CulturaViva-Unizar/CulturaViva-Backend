const { User } = require("../models/userModel");
const { Event } = require("../models/eventModel");
const { toObjectId } = require("../utils/utils");

class UserController {

  /**
   * Comprueba si el usuario es admin
   */
  async checkAdmin(req, res, next) {
      try {
          const user = await User.findById(toObjectId(req.userId));
          if (!user.admin) {
            res.status(403).json({
              success: false,
              message: "Acceso no autorizado al recurso.",
            });
          }
          next();
      } catch (error) {
          console.error("Error al comprobar admin:", error);
          return res.status(error.status || 500).json({
              success: false,
              message: error.message || "Error interno del servidor.",
          });
      }
  }

  /**
   * Comprueba si el usuario es admin o dueño del perfil
   */
  async checkAdminOrUser(req, res, next) {
      try {
        if(req.userId.toString() === req.params.id) return next();
        const user = await User.findById(toObjectId(req.userId));
        if(!user) {
          res.status(500).json({
            success: false,
            message: "Error interno del servidor al comprobar el usuario.",
          });
        }
        if(user.admin) return next();
        res.status(403).json({
          success: false,
          message: "Acceso no autorizado al recurso.",
        });
      } catch (error) {
          return res.status(error.status || 500 ).json({
              success: false,
              message: error.message || "Error interno del servidor.",
          });
      }
  }

  /**
   * Obtiene todos los usuarios
   */
  async getUsers(req, res) {
      try {
          const users = await User.find({}).select("-password");
          return res.status(200).json({
              success: true,
              data: users
          });
      } catch (error) {
          console.error("Error al obtener usuarios:", error);
          return res.status(500).json({
              success: false,
              message: "Error interno del servidor al obtener usuarios",
          });
      }
  }

  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(req, res) {
    const userId = req.params.id;
    console.log("User ID:", userId);
    try {
        const user = await User.findById(toObjectId(userId)).select("-password");
        if (!user) {
            return res.status(404).json({
              success: false,
              message: "Usuario no encontrado"
            });
        }
        return res.status(200).json({
          success: true,
          data: user
        });
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener usuario por ID",
        });
    }
}

  /**
   * Actualiza todo el perfil del usuario
   */
  async updateProfile(req, res) {
    try {
      const { name, email, phone } = req.body;
      const userId = req.params.id;

      const updatedUser = await User.findByIdAndUpdate(
        toObjectId(userId),
        { name, email, phone },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Perfil actualizado exitosamente",
        data: updatedUser
      });    

    } catch (error) {
      console.error("Error al actualizar el perfil entero:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al actualizar el perfil entero",
      });
    }
  }


  /**
   * Obtiene los items guardados por el usuario
   */
  async getSavedItems(req, res) {
    try {
      const { name, date, category } = req.query;

      const userId = req.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 16;

      const filters = {};
      if (name) filters.name = name
      if (date) filters.date = date
      if (category) filters.category = category
      console.log(filters);
      
      const user = await User.findById(toObjectId(userId))

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

    const savedItems = await Event.find({
      _id: { $in: user.savedItems },
      ...filters,
    }).limit(limit) 
      .skip((page - 1) * limit);

      return res.status(200).json({
        success: true,
        data: {
          savedItems: savedItems,
          currentPage: page,
          totalPages: Math.ceil(savedItems.length / limit),
          totalItems: savedItems.length
        },
      });

    } catch (error) {
      console.error("Error al obtener los items guardados:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener los items guardados",
      });
    }
  }

  /**
   * Obtiene todos los comentarios de un usuario
   */
  async getUserComments(req, res) {
      const userId = req.params.userId;

      try {
          const user = await User.findById(toObjectId(userId));
          if (!user) {
              return res.status(404).json({
                  success: false,
                  message: "Usuario no encontrado"
              });
          }

          const comments = await CommentModel.find({ userId: userId });

          if (!comments || comments.length === 0) {
              return res.status(404).json({
                  success: false,
                  message: "No se encontraron comentarios para este usuario"
              });
          }

          return res.status(200).json({
              success: true,
              message: "Comentarios obtenidos exitosamente",
              data: comments
          });

      } catch{
          console.error("Error al obtener comentarios del usuario:", error);
          return res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener comentarios del usuario",
          });
      }
  }
  /**
   * Guarda un evento en el perfil del usuario
   */
  async saveItem(req, res) {
    const userId = req.userId;
    const { eventId } = req.body;

    try {
      const user = await User.findById((userId));

      user.savedItems.push(toObjectId(eventId));
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Evento guardado exitosamente",
        data: user.savedItems
      });
    } catch (error) {
      console.error("Error al guardar el evento:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al guardar el evento",
      });
    }
  }

  /**
   * Obtiene los eventos a los que el usuario asiste
   */
  async getAttendingItems(req, res) {

    const { name, date, category } = req.query;

    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;

    const filters = {};
    if (name) filters.name = name
    if (date) filters.date = date
    if (category) filters.category = category

    try {
      const user = await User.findById(toObjectId(userId))

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }
      console.log(user.asistsTo);
      const attendingItems = await Event.find({
        _id: { $in: user.asistsTo },
        ...filters,
      }).limit(limit) 
        .skip((page - 1) * limit);

      return res.status(200).json({
        success: true,
        data: {
          items: attendingItems,
          currentPage: page,
          totalPages: Math.ceil(attendingItems.length / limit),
          totalItems: attendingItems.length
        },
      });

    } catch (error) {
      console.error("Error al obtener los eventos a los que asiste:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener los eventos a los que asiste",
      });
    }
  }

  /**
   * Marca como asistiente a un evento
   */
  async attendItem(req, res) {
    const userId = req.userId;
    const { eventId } = req.body;

    try {
      const user = await User.findById(toObjectId(userId));

      user.asistsTo.push(toObjectId(eventId));
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Evento marcado como asistente exitosamente",
        data: user.attendingItems
      });
    }
    catch (error) {
      console.error("Error al marcar el evento como asistente:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al marcar el evento como asistente",
      });
    }
  }

  /**
   * Elimina un evento guardado del perfil del usuario
   */
  async removeSavedItem(req, res) {
    const userId = req.userId;
    const { eventId } = req.params;

    try {
      const user = await User.findById(toObjectId(userId));

      user.savedItems = user.savedItems.filter(item => item.toString() !== eventId);
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Evento eliminado de los guardados exitosamente",
        data: user.savedItems
      });
    } catch (error) {
      console.error("Error al eliminar el evento guardado:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al eliminar el evento guardado",
      });
    }
  }

  /**
   * Elimina un evento al que el usuario asiste
   */
  async removeAttendingItem(req, res) {
    const userId = req.userId;
    const { eventId } = req.params;

    try {
      const user = await User.findById(toObjectId(userId));
      user.asistsTo = user.asistsTo.filter(item => item.toString() !== eventId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Evento eliminado de los asistidos exitosamente",
        data: user.attendingItems
      });
    }
    catch (error) {
      console.error("Error al eliminar el evento asistido:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al eliminar el evento asistido",
      });
    }
  }

}

module.exports = new UserController();
