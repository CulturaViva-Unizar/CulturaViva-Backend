const Chat = require('../models/chatModel');
const { create } = require('../models/messageModel');
const { User } = require('../models/userModel');

async function isUserInChat(userId, chatId) {
  const chat = await Chat.findById(chatId);
  if (!chat) return false;
  return (
    chat.user1.toString() === userId ||
    chat.user2.toString() === userId
  );
}

async function checkIsWhoHeSays(userId, jwtUserId) {
  return userId === jwtUserId ? true : false;
}

async function createChatDTO(chat, userId) {
  const otherUserId = chat.user1.toString() === userId.toString() ? chat.user2 : chat.user1;
  const otherUser = await User.findById(otherUserId).select('name -userType');
  
  const chatDTO = {
    mensajes: chat.mensajes,
    id: chat._id,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    user: otherUser
  };
  return chatDTO;
}

module.exports = { isUserInChat, checkIsWhoHeSays, createChatDTO };
