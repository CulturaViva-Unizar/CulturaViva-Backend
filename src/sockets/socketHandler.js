const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');
const { isUserInChat, checkIsWhoHeSays } = require('../utils/chatUtils');
const logger = require('../logger/logger.js');


module.exports = (io) => {

  io.on('connection', (socket) => {
    logger.info('Nuevo cliente conectado', {
      socketId: socket.id,
      userId: socket.user.id
    });

    // El usuario se une a la sala del chat 'chatId'
    socket.on('joinChat', async (chatId) => {
      const userId = socket.user.id; // el user id se obtiene del JWT, middleware anterior

      const allowed = await isUserInChat(userId, chatId);

      if (!allowed) {
        logger.error(`Usuario no autorizado para unirse al chat ${chatId}`, {
          socketId: socket.id,
          userId: userId
        });
        socket.emit('errorMessage', { error: 'No tienes acceso a este chat' });
        return;
      }
      socket.join(chatId);
      logger.info(`Usuario ${userId} se unió al chat ${chatId}`, {
        socketId: socket.id,
        chatId: chatId
      });
    });

    // El usuario abandona la sala del chat 'chatId'
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      logger.info(`Usuario ${socket.user.id} abandonó el chat ${chatId}`, {
        socketId: socket.id,
        chatId: chatId
      });
    });

    // El usuario 'userId' envía el mensaje 'text' al chat 'chatId'
    socket.on('sendMessage', async (data) => {
      try {
        const { text, userId, chatId } = data;
        
        const [isInChat, isWhoHeSays] = await Promise.all([
          isUserInChat(socket.user.id, chatId),
          checkIsWhoHeSays(userId, socket.user.id)
        ]);
        
        const allowed = isInChat && isWhoHeSays;
        if (!allowed) {
          logger.error(`Usuario no autorizado para enviar mensaje al chat ${chatId}`, {
            socketId: socket.id,
            userId: socket.user.id,
            chatId: chatId
          });
          socket.emit('errorMessage', { error: 'No tienes acceso a este chat' });
          return;
        }


        // 1. Crear y guardar el mensaje en mongo
        const message = await Message.create({
          text,
          user: userId,
          chat: chatId
        });

        // 2. Agregar mensaje al chat en mongo 
        await Chat.findByIdAndUpdate(chatId, {
          $push: { mensajes: message._id }
        });

        // 3. Emitir el mensaje a los usuarios de esa sala (frontend debe suscribirse a esto)
        io.to(chatId).emit('receiveMessage', {
          _id: message._id,
          text: message.text,
          timestamp: message.timestamp,
          user: userId,
          chat: chatId
        });

      } catch (error) {
        logger.error('Error al enviar el mensaje', {
          message: error.message,
          stack: error.stack,
          socketId: socket.id,
          userId: socket.user.id
        });
        socket.emit('errorMessage', { error: 'No se pudo enviar el mensaje' }); // si falla emito error, frontned debe suscribirse a este topic
      }
    });

    // Sin más el usuario se desconecta
    socket.on('disconnect', () => {
      logger.info('Cliente desconectado', {
        socketId: socket.id,
        userId: socket.user.id
      });
    });
  });
};
