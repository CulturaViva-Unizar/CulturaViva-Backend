const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const Chat = require('../../src/models/chatModel');
const User = require('../../src/models/userModel');
const Message = require('../../src/models/messageModel');


/******************************************************************
* Test para probar el modelo de datos del chat.                   *
* Pertenece a la suite de tests "dataModel", que realiza pruebas  *
* con la base de datos real.                                      *    
* Si se quieren ver los objetos en Atlas, se pueden comentar las  *
* sentencias correspondientes en los beforeAll, beforeEach y      *
* afterAll.                                                       *          
*******************************************************************/

let user1, user2;
beforeAll(async () => {
  await connectDB();
  await User.deleteOne({ email: 'user1@example.com' });
  await User.deleteOne({ email: 'user2@example.com' });
  user1 = new User({
    name: 'User1',
    email: 'user1@example.com',
    phone: '1234567890'
  });

  user2 = new User({
    name: 'User2',
    email: 'user2@example.com',
    phone: '0987654321'
  });

  await user1.save();
  await user2.save();
});

beforeEach(async () => {
  await Chat.deleteMany({ // eliminamos todos los chats
    $or: [
      { user1: user1._id, user2: user2._id },
      { user1: user2._id, user2: user1._id }
    ]
  });
  await Message.deleteMany({ // y todos los mensajes
    user: { $in: [user1._id, user2._id] }
  });
});

afterAll(async () => {
  await Chat.deleteMany({ // eliminamos todos los chats
    $or: [
      { user1: user1._id, user2: user2._id },
      { user1: user2._id, user2: user1._id }
    ]
  });
  await Message.deleteMany({ // y todos los mensajes
    user: { $in: [user1._id, user2._id] }
  });
  await disconnectDB();
});

describe('Chat Model Test', () => {
  it('should create a chat between two users', async () => {
    const chat = new Chat({
      user1: user1._id,
      user2: user2._id
    });

    await chat.save();

    const foundChat = await Chat.findById(chat._id).populate('user1 user2');
    expect(foundChat).toBeDefined();
    expect(foundChat.user1.name).toBe('User1');
    expect(foundChat.user2.name).toBe('User2');
  });

  it('should not create a chat if user1 and user2 are the same', async () => {
    const chat = new Chat({
      user1: user1._id,
      user2: user1._id
    });

    try {
      await chat.save();
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.errors.user2).toBeDefined();
    }
  });

  it('should save and populate messages array correctly', async () => {
    const chat = new Chat({
      user1: user1._id,
      user2: user2._id
    });

    const message = new Message({
      text: 'Hello User2!',
      user: user1._id,
      chat: chat._id
    });

    await message.save();

    chat.mensajes.push(message._id);

    await chat.save();

    const foundChat = await Chat.findById(chat._id).populate({
      path: 'mensajes',
      populate: { path: 'user', model: 'User' }
    });

    expect(foundChat).toBeDefined();
    expect(foundChat.mensajes.length).toBe(1);
    expect(foundChat.mensajes[0].text).toBe('Hello User2!');
    expect(foundChat.mensajes[0].user.name).toBe('User1');
  });
});
