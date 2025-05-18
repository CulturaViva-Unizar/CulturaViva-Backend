const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const { Comment, Valoration, Response } = require('../../src/models/commentModel');

describe('Comment Model Tests', () => {
  let userId;

  beforeAll(async () => {
    await connectDB();

    userId = new mongoose.Types.ObjectId();
    eventId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await Comment.deleteMany({ text: /test/i });
    await disconnectDB();
  });

  it('debería permitir crear un comentario con datos válidos', async () => {
    const comment = new Comment({
      text: 'This is a test comment',
      user: userId, 
      event: eventId
    });

    const savedComment = await comment.save();

    expect(savedComment).toBeDefined();
    expect(savedComment.text).toBe('This is a test comment');
    expect(savedComment.user.toString()).toBe(userId.toString());
    expect(savedComment.date).toBeDefined();
  });

  it('no debería permitir crear un comentario sin texto', async () => {
    const comment = new Comment({
      user: userId,
      event: eventId
    });

    await expect(comment.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('no debería permitir crear un comentario sin usuario', async () => {
    const comment = new Comment({
      text: 'This is another test comment',
      event: eventId
    });

    await expect(comment.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
  it('no debería permitir crear un comentario sin evento', async () => {
    const comment = new Comment({
      text: 'This is another test comment',
      user: userId
    });

    await expect(comment.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});

describe('Valoration Model Tests', () => {
  let userId;

  beforeAll(async () => {
    await connectDB();
    userId = new mongoose.Types.ObjectId();
    eventId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await Valoration.deleteMany({ text: /test/i });
    await disconnectDB();
  });

  it('debería permitir crear una valoración con datos válidos', async () => {
    const valoration = new Valoration({
      text: 'This is a test valoration',
      user: userId,
      value: 5,
      event: eventId
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
      user: userId,
      event: eventId
    });

    await expect(valoration.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});

describe('Response Model Tests', () => {
  let userId, commentId;

  beforeAll(async () => {
    await connectDB();

    userId = new mongoose.Types.ObjectId();
    eventId = new mongoose.Types.ObjectId();

    // Crear un comentario para asociar con la respuesta
    const comment = new Comment({
      text: 'This is a test parent comment',
      user: userId,
      event: eventId
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
      responseTo: commentId,
      event: eventId
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
      user: userId,
      event: eventId
    });

    await expect(response.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('debería asignar valores por defecto correctamente', async () => {
    const comment = new Comment({
      text: 'Test default values',
      user: userId,
      event: eventId
    });

    const saved = await comment.save();

    expect(saved.date).toBeInstanceOf(Date);
    expect(saved.deleted).toBe(false);
    expect(saved.deleteAt).toBeNull();
  });

  it('debería transformar el documento eliminando _id y agregando id', async () => {
    const comment = new Comment({
      text: 'JSON transform test',
      user: userId,
      event: eventId
    });

    const saved = await comment.save();
    const json = saved.toJSON();

    expect(json.id).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
  });

  it('debería permitir crear una valoración sin texto', async () => {
    const valoration = new Valoration({
      user: userId,
      value: 4,
      event: eventId
    });

    const saved = await valoration.save();
    expect(saved).toBeDefined();
    expect(saved.text).toBeUndefined();
    expect(saved.value).toBe(4);
  });

  it('debería establecer commentType automáticamente en valoraciones y respuestas', async () => {
    const val = new Valoration({
      text: 'valoration type test',
      value: 3,
      user: userId,
      event: eventId
    });

    const resp = new Response({
      text: 'response type test',
      responseTo: commentId,
      user: userId,
      event: eventId
    });

    const savedVal = await val.save();
    const savedResp = await resp.save();

    expect(savedVal.commentType).toBe('Valoration');
    expect(savedResp.commentType).toBe('Response');
  });


  it('no debería permitir una valoración con un valor no numérico', async () => {
    const valoration = new Valoration({
      value: 'cinco',
      user: userId,
      event: eventId
    });

    await expect(valoration.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});