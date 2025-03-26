const UserModel = require("../models/userModel.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();


exports.login = async (req, res) => {
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
        return res.status(403).json({ message: "Contraseña incorrecta" });
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
        message: "Error interno del servidor",
      });
    }
  };