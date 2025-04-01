const UserModel = require("../models/userModel");

class UserController {

  /**
   * Obtiene el perfil del usuario
   */
  async getProfile(req, res) {
    try {
      const userId = req.userId;

      const user = await UserModel.findById(userId);

      return res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error("Error al obtener perfil:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al obtener perfil",
      });
    }
  }

  /**
   * Actualiza todo el perfil del usuario
   */
  async updateProfile(req, res) {
    try {
      const { name, email, phone } = req.body;
      const userId = req.userId;

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
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
      
      const total = await UserModel.findById(userId).select('savedItems').countDocuments();
      const user = await UserModel.findById(userId)
      .populate({
        path: 'savedItems',
        match: filters,
        options: {
          limit: limit,
          skip: skip
        }
      });

      return res.status(200).json({
        success: true,
        data: user.savedItems,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
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
   * Guarda un evento en el perfil del usuario
   */
  async saveItem(req, res) {
    const userId = req.userId;
    const { eventId } = req.body;

    try {
      const user = await UserModel.findById(userId);

      user.savedItems.push(eventId);
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
      const total = await UserModel.findById(userId).select('asistsTo').countDocuments();
      const user = await UserModel.findById(userId)
      .populate({
        path: 'asistsTo',
        match: filters,
        options: {
          limit: limit,
          skip: skip
        }
        
      });

      return res.status(200).json({
        success: true,
        data: user.asistsTo,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
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
      const user = await UserModel.findById(userId);

      user.asistsTo.push(eventId);
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
      const user = await UserModel.findById(userId);

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
      const user = await UserModel.findById(userId);
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


