const { Chat } = require("../models/chatModel");
const { Message } = require("../models/messageModel");
const { toObjectId } = require("../utils/utils");

class ChatController {

  async checkUserInChat(req, res, next) { //TODO: poner en las rutas dwespues del middleware de passport
      try {
          const userId = req.user._id; // el user id se obtiene del JWT, middleware anterior
  
          const chatId = req.params.chatId;
          const chat = await Chat.findById(chatId);
  
          if (!chat) {
              return res.status(404).json({
                  success: false,
                  message: "Chat no encontrado"
              });
          }
  
          // Verifica si el usuario es parte del chat
          if (chat.user1.toString() !== userId.toString() && chat.user2.toString() !== userId.toString()) {
              return res.status(403).json({
                  success: false,
                  message: "No tienes acceso a este chat"
              });
          }
  
          next();
      } catch (error) {
          console.error("Error en checkUserInChat:", error);
          return res.status(500).json({
              success: false,
              message: "Error interno del servidor"
          });
      }
  }

  // TODO: controllers específicos

}

module.exports = new ChatController();
