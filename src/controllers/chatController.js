const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const { User } = require("../models/userModel");
const { isUserInChat, createChatDTO } = require("../utils/chatUtils");
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

  async createChat(req, res) {
    const user1 = req.userId;
    const user2 = req.body.user;
    console.log("user1", user1);
    console.log("user2", user2);

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

    const chatDTO = await createChatDTO(newChat, user1);

    return createCreatedResponse(res, "Chat creado exitosamente", chatDTO);
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
