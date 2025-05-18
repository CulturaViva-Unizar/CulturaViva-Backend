const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const Message = require('../../src/models/messageModel');

describe('Message Model Tests', () => {
  let userId, chatId;

  beforeAll(async () => {
    await connectDB();

    // Simulamos un ID de usuario y de chat
    userId = new mongoose.Types.ObjectId();
    chatId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await Message.deleteMany({ text: /test/i });
    await disconnectDB();
  });

  it('debería permitir crear un mensaje con datos válidos', async () => {
    const message = new Message({
      text: 'Este es un mensaje de prueba',
      user: userId,
      chat: chatId
    });

    const savedMessage = await message.save();

    expect(savedMessage).toBeDefined();
    expect(savedMessage.text).toBe('Este es un mensaje de prueba');
    expect(savedMessage.user.toString()).toBe(userId.toString());
    expect(savedMessage.chat.toString()).toBe(chatId.toString());
    expect(savedMessage.timestamp).toBeInstanceOf(Date);
  });

  it('no debería permitir crear un mensaje sin texto', async () => {
    const message = new Message({
      user: userId,
      chat: chatId
    });

    await expect(message.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('no debería permitir crear un mensaje sin usuario', async () => {
    const message = new Message({
      text: 'Mensaje sin usuario',
      chat: chatId
    });

    await expect(message.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('no debería permitir crear un mensaje sin chat', async () => {
    const message = new Message({
      text: 'Mensaje sin chat',
      user: userId
    });

    await expect(message.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('debería transformar el documento eliminando _id y agregando id', async () => {
    const message = new Message({
      text: 'Transformación JSON',
      user: userId,
      chat: chatId
    });

    const saved = await message.save();
    const json = saved.toJSON();

    expect(json.id).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });

  it('debería asignar automáticamente la fecha si no se proporciona', async () => {
    const message = new Message({
      text: 'Mensaje con fecha automática',
      user: userId,
      chat: chatId
    });

    const saved = await message.save();

    expect(saved.timestamp).toBeInstanceOf(Date);
  });
});
