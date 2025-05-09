const { UserPassword } = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../config/env.js');

class AuthController {

  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(req, res) {
    const { email, password, name, phone } = req.body;

    // Validación de campos requeridos
    if (!email || !password || !name) {
      return createBadRequestResponse(res, "Todos los campos son requeridos: email, password, name");
    }

    // Verificar si el usuario ya existe
    const existingUser = await UserPassword.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return createConflictResponse(res, "El email ya está registrado");
    }

    // Crear el nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserPassword.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      admin: false,
      active: true
    });

    return createCreatedResponse(res, "Usuario creado exitosamente", {
      user: createUserDto(userExists),
      accessToken: generateToken(user)
    });
  }

  /**
   * Realiza el login de un usuario
   */
  async login(req, res) {
    const { email, password } = req.body;

    // Buscar usuario
    const userExists = await UserPassword.findOne({ email: email });
    if (!userExists) {
      return createUnauthorizedResponse(res, "Credenciales incorrectas");
    }

    if (!userExists.active) {
      return createUnauthorizedResponse(res, "Credenciales incorrectas");
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      return createUnauthorizedResponse(res, "Credenciales incorrectas");
    }

    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        user: createUserDto(userExists),
        accessToken: generateToken(userExists)
      }
    });
  }

  async changePassword(req, res) {

    const { newPassword, oldPassword } = req.body;

    const userId = req.userId;
    const user = await UserPassword.findById(userId);

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return createUnauthorizedResponse(res, "Contraseña incorrecta");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return createOkResponse(res, "Contraseña cambiada exitosamente");
  }
}

function generateToken(user) {
  const token = jwt.sign(createUserDto(user), env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES });

  return token;
}

function createUserDto(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    admin: user.admin,
    type: user.userType
  };
}

module.exports = new AuthController();
