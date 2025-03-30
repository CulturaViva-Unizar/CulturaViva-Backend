const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');

class UserController {

  constructor() {
    this.userModel = new UserModel();
  }

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
      const userId = req.userId;

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 16;  
      
      const total = await UserModel.findById(userId).select('savedItems').countDocuments();
      const user = await UserModel.findById(userId)
      .populate({
        path: 'savedItems',
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
   * Actualiza un elemento específico del usuario
   */
  async changeUserElement(userId, element, value) {
    try {    

      const updateData = { [field]: value };
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: "Campo actualizado exitosamente",
        data: updatedUser
      });

    } catch (error) {
      console.error("Error al actualizar un elemento del perfil:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al actualizar un elemento del perfil",
      });
    }
  }
}

// Exportar una única instancia del controlador
module.exports = new UserController();


