const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { User } = require("../models/userModel");
const { isUserInChat } = require("../utils/chatUtils");

class ChatController {

  async checkUserInChat(req, res, next) { //TODO: poner en las rutas dwespues del middleware de passport
      try {
          const userId = req.userId; // el user id se obtiene del JWT, middleware anterior
  
          const chatId = req.params.chatId;
          const chat = await Chat.findById(chatId);
  
          if (!chat) {
              return res.status(404).json({
                  success: false,
                  message: "Chat no encontrado"
              });
          }

          if(isUserInChat(userId, chatId)){
            return next();
          } else {
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

  // Verifica si el usuario está intentando crear un chat al que pertenece
  async checkIsUser(req, res, next){
    try {
        const userId = req.userId; // el user id se obtiene del JWT, middleware anterior
        const { user1, user2 } = req.body;


        // el usuario que crea el chat debe estar en el chat
        if (user1 === userId.toString() || user2 === userId.toString()) {
            console.log("El usuario está en el chat");
            
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "No puedes crear un chat en el que no participes"
        });
    } catch (error) {
        console.error("Error en checkIsUser:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }

  }

  async createChat(req, res) {
    try{ 
        const { user1, user2 } = req.body;
    
        // Verifica si el chat ya existe
        const existingChat = await Chat.findOne({
            $or: [
            { user1, user2 },
            { user1: user2, user2: user1 }
            ]
        });
    
        if (existingChat) {
            return res.status(409).json({
            success: false,
            message: "El chat ya existe"
            });
        }

        if (user1.toString() === user2.toString()) {
            return res.status(400).json({
                success: false,
                message: "No puedes crear un chat contigo mismo"
            });
        }
    
        const newChat = new Chat({ user1, user2 });
        await newChat.save();

        // Agregar el chat a los usuarios
        await User.findByIdAndUpdate(user1, { $push: { chats: newChat._id } });
        await User.findByIdAndUpdate(user2, { $push: { chats: newChat._id } });
    
        return res.status(201).json({
            success: true,
            message: "Chat creado exitosamente",
            data: newChat
        });
    } catch (error) {
        console.error("Error al crear el chat:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
  }

  async deleteChat(req, res) {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId);
    
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat no encontrado"
            });
        }
    
        // Elimina el chat
        await Chat.findByIdAndDelete(chatId);
    
        // Elimina los mensajes asociados al chat
        await Message.deleteMany({ chat: chatId });

        // Elimina el chat de los usuarios
        await User.findByIdAndUpdate(chat.user1, { $pull: { chats: chatId } });
        await User.findByIdAndUpdate(chat.user2, { $pull: { chats: chatId } });
    
        return res.status(200).json({
            success: true,
            message: "Chat eliminado exitosamente"
        });
    } catch (error) {
        console.error("Error al eliminar el chat:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
  }

  async getChatById(req, res) {
    try {
        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId);
    
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat no encontrado"
            });
        }
    
        return res.status(200).json({
            success: true,
            message: "Chat encontrado",
            data: chat
        });
    } catch (error) {
        console.error("Error al obtener el chat:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
  }

  async getChatMessages(req, res) {
    try {
        const chatId = req.params.chatId;
        console.log("chatId", chatId);
        const chat = await Chat.findById(chatId).populate('mensajes');
    
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat no encontrado"
            });
        }
    
        return res.status(200).json({
            success: true,
            message: "Mensajes encontrados",
            data: chat.mensajes
        });
    } catch (error) {
        console.error("Error al obtener los mensajes del chat:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
  }

}

module.exports = new ChatController();
