const { UserPassword } = require("../models/userModel.js");
const bcrypt = require("bcrypt");

const {
  createBadRequestResponse,
  createConflictResponse,
  createUnauthorizedResponse,
  createOkResponse,
  createResponse,
} = require("../utils/utils");
const logger = require("../logger/logger.js");
const { createUserDto, signJwt } = require("../utils/authUtils.js");

class AuthController {
  /**
   * Registra un nuevo usuario en el sistema
   */
  async register(req, res, next) {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return createBadRequestResponse(
        res,
        "Todos los campos son requeridos: email, password, name"
      );
    }

    const existingUser = await UserPassword.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return createConflictResponse(res, "El email ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserPassword.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      admin: false,
      active: true,
    });

    req.user = user;
    res.status(201);
    next();
  }

  /**
   * Realiza el login de un usuario
   */
  async login(req, res, next) {
    const { email, password } = req.body;

    const userExists = await UserPassword.findOne({ email: email });
    if (!userExists) {
      logger.warn('Intento fallido de login: usuario no encontrado', {
        email,
        ip: req.ip
      });
      return createUnauthorizedResponse(res, "Credenciales incorrectas");
    }

    if (!userExists.active) {
      logger.warn('Intento fallido de login: usuario inactivo', {
        email,
        ip: req.ip
      });
      return createUnauthorizedResponse(res, "Credenciales incorrectas");
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      logger.warn('Intento fallido de login: contraseña incorrecta', {
        email,
        ip: req.ip
      });
      return createUnauthorizedResponse(res, "Credenciales incorrectas");
    }

    req.user = userExists;
    next();
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

    createOkResponse(res, "Contraseña cambiada exitosamente");
  }

  async generateToken(req, res) {
    const user = req.user;
    const token = signJwt(user);

    const status = res.statusCode !== 200 ? res.statusCode : 200;

    createResponse(res, status, "Token generado exitosamente", {
      user: createUserDto(user),
      accessToken: token,
    });
  }
}

module.exports = new AuthController();
