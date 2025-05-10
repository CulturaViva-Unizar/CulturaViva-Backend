const Message = require('../models/messageModel');
const Chat = require('../models/chatModel');
const { isUserInChat, checkIsWhoHeSays } = require('../utils/chatUtils');


module.exports = (io) => {

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // El usuario se une a la sala del chat 'chatId'
    socket.on('joinChat', async (chatId) => {
      const userId = socket.user.id; // el user id se obtiene del JWT, middleware anterior

      console.log(`Usuario ${userId} se unió al chat ${chatId}`);

      const allowed = await isUserInChat(userId, chatId);

      if (!allowed) {
        console.log(`Usuario no autorizado para unirse al chat ${chatId}`);
        socket.emit('errorMessage', { error: 'No tienes acceso a este chat' });
        return;
      }
      socket.join(chatId);
      console.log(`Usuario se unió al chat ${chatId}`);
    });

    // El usuario abandona la sala del chat 'chatId'
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`Usuario salió de la sala ${chatId}`);
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
          console.log(`Usuario no autorizado para unirse al chat ${chatId}`);
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
        console.error('Error enviando mensaje:', error);
        socket.emit('errorMessage', { error: 'No se pudo enviar el mensaje' }); // si falla emito error, frontned debe suscribirse a este topic
      }
    });

    // Sin más el usuario se desconecta
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};
