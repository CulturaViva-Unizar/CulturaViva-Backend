const UserModel = require("../models/userModel.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

class AuthController {

  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(req, res) {
    try {
      const { email, password, name, phone } = req.body;
      
      // Validación de campos requeridos
      if (!email || !password || !name || !phone) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos son requeridos: email, password, name, phone"
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "El email ya está registrado"
        });
      }

      // Crear el nuevo usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        phone,
        admin: false,
        active: true
      });

      return res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });

    } catch (error) {
      console.error("Error en registro:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al registrar usuario",
      });
    }
  }

  /**
   * Realiza el login de un usuario
   */
  async login(req, res) {
    try {
      
      const { email, password } = req.body;

      // Buscar usuario
      const userExists = await UserModel.findOne({ email: email });
      if (!userExists) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, userExists.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Generar token
      const accessToken = jwt.sign(
        {
          id: userExists._id,
          email: userExists.email,
          admin: userExists.admin
        },
        process.env.JWT_SECRET || 'secret',
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
      );

      return res.status(200).json({ 
        message: "Login exitoso",
        accessToken,
        user: {
          id: userExists._id,
          email: userExists.email,
          name: userExists.name,
          admin: userExists.admin
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ 
        message: "Error interno del servidor al realizar login",
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { newPassword, oldPassword } = req.body;

      const userId = req.userId;
      const user = await UserModel.findById(userId);

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({ message: "Contraseña restablecida exitosamente" });
      
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al restablecer la contraseña",
      });
    }
  }
}
module.exports = new AuthController();