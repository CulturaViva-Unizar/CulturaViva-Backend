const Chat = require('../models/chatModel');

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

module.exports = { isUserInChat, checkIsWhoHeSays };
