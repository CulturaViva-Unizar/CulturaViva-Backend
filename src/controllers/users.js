import UserModel from "../models/userModel";
import bcrypt from 'bcrypt';

/**
 * Registra un nuevo usuario en el sistema
 */
export const register = async (req, res) => {
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
};

/**
 * Obtiene el perfil del usuario
 */
export const getProfile = async (req, res) => {
  try {
    // El id del usuario viene del passport
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "No autorizado"
      });
    }

    const user = await UserModel.findById(userId)

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
};