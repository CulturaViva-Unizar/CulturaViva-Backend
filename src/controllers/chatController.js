const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { User } = require("../models/userModel");
const { isUserInChat } = require("../utils/chatUtils");
const { 
        createNotFoundResponse, 
        createForbiddenResponse, 
        createConflictResponse,
        createBadRequestResponse, 
        createCreatedResponse,
        createOkResponse
    } = require("../utils/utils");

class ChatController {

  async checkUserInChat(req, res, next) { //TODO: poner en las rutas dwespues del middleware de passport
        const userId = req.userId; // el user id se obtiene del JWT, middleware anterior

        const chatId = req.params.chatId;
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return createNotFoundResponse(res, "Chat no encontrado");
        }

        if(isUserInChat(userId, chatId)){
        return next();
        } else {
            return createForbiddenResponse(res, "No tienes permiso para acceder a este chat");
        }
  }

  // Verifica si el usuario está intentando crear un chat al que pertenece
  async checkIsUser(req, res, next){
    const userId = req.userId; // el user id se obtiene del JWT, middleware anterior
    const { user1, user2 } = req.body;


    // el usuario que crea el chat debe estar en el chat
    if (user1 === userId.toString() || user2 === userId.toString()) {
        console.log("El usuario está en el chat");
        
        return next();
    }

    return createForbiddenResponse(res, "No tienes permiso para crear este chat");
  }

  async createChat(req, res) {
    const { user1, user2 } = req.body;

    const existingChat = await Chat.findOne({
        $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
        ]
    });

    if (existingChat) {
        return createConflictResponse(res, "Ya existe un chat entre estos usuarios");
    }

    if (user1.toString() === user2.toString()) {
        return createBadRequestResponse(res, "No puedes crear un chat contigo mismo");
    }

    const newChat = new Chat({ user1, user2 });
    await newChat.save();

    // Agregar el chat a los usuarios
    await User.findByIdAndUpdate(user1, { $push: { chats: newChat._id } });
    await User.findByIdAndUpdate(user2, { $push: { chats: newChat._id } });

    return createCreatedResponse(res, "Chat creado exitosamente", newChat);
  }

  async deleteChat(req, res) {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);

    if (!chat) {
        return createNotFoundResponse(res, "Chat no encontrado");
    }

    // Elimina el chat
    await Chat.findByIdAndDelete(chatId);

    // Elimina los mensajes asociados al chat
    await Message.deleteMany({ chat: chatId });

    // Elimina el chat de los usuarios
    await User.findByIdAndUpdate(chat.user1, { $pull: { chats: chatId } });
    await User.findByIdAndUpdate(chat.user2, { $pull: { chats: chatId } });

    return createOkResponse(res, "Chat eliminado exitosamente");
  }

  async getChatById(req, res) {
    const chatId = req.params.chatId;
    const chat = await Chat.findById(chatId);

    if (!chat) {
        return createNotFoundResponse(res, "Chat no encontrado");
    }

    return createOkResponse(res, "Chat encontrado", chat);
  }

  async getChatMessages(req, res) {
    const chatId = req.params.chatId;
    console.log("chatId", chatId);
    const chat = await Chat.findById(chatId).populate('mensajes');

    if (!chat) {
        return createNotFoundResponse(res, "Chat no encontrado");
    }

    return createOkResponse(res, "Mensajes del chat encontrados", chat.mensajes);
  }

}

module.exports = new ChatController();
