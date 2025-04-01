const UserModel = require("../models/userModel");

class AdminController {

    /**
     * Obtiene todos los usuarios
     */
    async getUsers(req, res) {
        try {
            const users = await UserModel.find({}).select("-password");
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
        const userId = req.params.userId;
        try {
            const user = await UserModel.findById(userId).select("-password");
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
     * Bloquea un usuario
     */
    async blockUser(req, res) {
        const userId = req.params.userId;

        if (userId === req.userId) {
            return res.status(403).json({
                success: false,
                message: "No puedes bloquear tu propio usuario"
            });
        }
        
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }
            user.active = false;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Usuario bloqueado exitosamente",
                data: user
            });
        } catch (error) {
            console.error("Error al bloquear/desbloquear usuario:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al bloquear/desbloquear usuario",
            });
        }
    }

    /**
     * Desbloquea un usuario
     */
    async unblockUser(req, res) {
        const userId = req.params.userId;

        if (userId === req.userId) {
            return res.status(403).json({
                success: false,
                message: "No puedes desbloquear tu propio usuario"
            });
        }

        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }
            user.active = true;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Usuario bloqueado exitosamente",
                data: user
            });
        } catch (error) {
            console.error("Error al bloquear/desbloquear usuario:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al bloquear/desbloquear usuario",
            });
        }
    }

    /**
     * Elimina un usuario
     */
    async deleteUser(req, res) {
        const userId = req.params.userId;

        if (userId === req.userId) {
            return res.status(403).json({
                success: false,
                message: "No puedes eliminar tu propio usuario"
            });
        }

        try {
            const user = await UserModel.findByIdAndDelete(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Usuario eliminado exitosamente",
                data: user
            });
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al eliminar usuario por ID",
            });
        }
    }

    /**
     * Comprueba si el usuario es admin
     */
    async checkAdmin(req, res, next) {
        const myUserId = req.userId;
        try {
            const user = await UserModel.findById(myUserId);
            if (!user.admin) {
                return res.status(401).json({
                    success: false,
                    message: "No es usuario admin",
                });
            }
            next();
        } catch (error) {
            console.error("Error al comprobar admin:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al comprobar admin",
            });
        }
    }

    /**
     * Hace admin al usuario
     */
    async makeAdmin(req, res) {
        const userId = req.params.userId;
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado"
                });
            }
            user.admin = true;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Usuario admin exitosamente",
                data: user
            });
        } catch (error) {
            console.error("Error al hacer admin:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al hacer admin",
            });
        }
    }
}

module.exports = new AdminController();