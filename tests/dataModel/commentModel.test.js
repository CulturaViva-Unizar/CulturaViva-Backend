const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const { Comment, Valoration, Response } = require('../../src/models/commentModel');

describe('Comment Model Tests', () => {
  let userId;

  beforeAll(async () => {
    await connectDB();

    userId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await Comment.deleteMany({ text: /test/i });
    await disconnectDB();
  });

  it('debería permitir crear un comentario con datos válidos', async () => {
    const comment = new Comment({
      text: 'This is a test comment',
      user: userId
    });

    const savedComment = await comment.save();

    expect(savedComment).toBeDefined();
    expect(savedComment.text).toBe('This is a test comment');
    expect(savedComment.user.toString()).toBe(userId.toString());
    expect(savedComment.date).toBeDefined();
  });

  it('no debería permitir crear un comentario sin texto', async () => {
    const comment = new Comment({
      user: userId
    });

    await expect(comment.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('no debería permitir crear un comentario sin usuario', async () => {
    const comment = new Comment({
      text: 'This is another test comment'
    });

    await expect(comment.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});

describe('Valoration Model Tests', () => {
  let userId;

  beforeAll(async () => {
    await connectDB();
    userId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await Valoration.deleteMany({ text: /test/i });
    await disconnectDB();
  });

  it('debería permitir crear una valoración con datos válidos', async () => {
    const valoration = new Valoration({
      text: 'This is a test valoration',
      user: userId,
      value: 5
    });

    const savedValoration = await valoration.save();

    expect(savedValoration).toBeDefined();
    expect(savedValoration.text).toBe('This is a test valoration');
    expect(savedValoration.user.toString()).toBe(userId.toString());
    expect(savedValoration.value).toBe(5);
  });

  it('no debería permitir crear una valoración sin valor', async () => {
    const valoration = new Valoration({
      text: 'This is another test valoration',
      user: userId
    });

    await expect(valoration.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});

describe('Response Model Tests', () => {
  let userId, commentId;

  beforeAll(async () => {
    await connectDB();

    userId = new mongoose.Types.ObjectId();

    // Crear un comentario para asociar con la respuesta
    const comment = new Comment({
      text: 'This is a test parent comment',
      user: userId
    });

    const savedComment = await comment.save();
    commentId = savedComment._id;
  });

  afterAll(async () => {
    await Response.deleteMany({ text: /test/i });
    await Comment.deleteMany({ text: /test/i });
    await disconnectDB();
  });

  it('debería permitir crear una respuesta con datos válidos', async () => {
    const response = new Response({
      text: 'This is a test response',
      user: userId,
      responseTo: commentId
    });

    const savedResponse = await response.save();

    expect(savedResponse).toBeDefined();
    expect(savedResponse.text).toBe('This is a test response');
    expect(savedResponse.user.toString()).toBe(userId.toString());
    expect(savedResponse.responseTo.toString()).toBe(commentId.toString());
  });

  it('no debería permitir crear una respuesta sin referencia a un comentario', async () => {
    const response = new Response({
      text: 'This is another test response',
      user: userId
    });

    await expect(response.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});