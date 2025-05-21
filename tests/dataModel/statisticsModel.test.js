const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const { Visit, DisableUsers, SavedItemsStats } = require('../../src/models/statisticsModel');

describe('Visit Model Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await Visit.deleteMany({ date: /^test-/ });
    await disconnectDB();
  });

  it('debería permitir crear un registro de visita con datos válidos', async () => {
    const visit = new Visit({
      date: 'test-2025-05-18',
      count: 10
    });

    const savedVisit = await visit.save();

    expect(savedVisit).toBeDefined();
    expect(savedVisit.date).toBe('test-2025-05-18');
    expect(savedVisit.count).toBe(10);
  });

  it('no debería permitir crear una visita sin fecha', async () => {
    const visit = new Visit({ count: 5 });

    await expect(visit.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('debería usar 0 como valor por defecto para count', async () => {
    const visit = new Visit({ date: 'test-2025-05-19' });
    const saved = await visit.save();

    expect(saved.count).toBe(0);
  });

  it('debería transformar correctamente el documento a JSON', async () => {
    const visit = new Visit({
      date: 'test-2025-05-20',
      count: 5
    });
    
    const savedVisit = await visit.save();
    const json = savedVisit.toJSON();
    
    expect(json.id).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.date).toBe('test-2025-05-20');
    expect(json.count).toBe(5);
  });
});

describe('DisableUsers Model Tests', () => {
  let userId1, userId2;

  beforeAll(async () => {
    await connectDB();
    userId1 = new mongoose.Types.ObjectId();
    userId2 = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await DisableUsers.deleteMany({ date: /^test-/ });
    await disconnectDB();
  });

  it('debería permitir crear un registro con usuarios deshabilitados', async () => {
    const disableUsers = new DisableUsers({
      date: 'test-2025-05-18',
      count: 2,
      users: [userId1, userId2]
    });

    const saved = await disableUsers.save();

    expect(saved).toBeDefined();
    expect(saved.date).toBe('test-2025-05-18');
    expect(saved.count).toBe(2);
    expect(saved.users).toContainEqual(userId1);
    expect(saved.users).toContainEqual(userId2);
  });

  it('debería establecer 0 como valor por defecto para count', async () => {
    const disable = new DisableUsers({
      date: 'test-2025-05-19',
      users: []
    });

    const saved = await disable.save();

    expect(saved.count).toBe(0);
    expect(saved.users.length).toBe(0);
  });

  it('no debería permitir crear un registro sin fecha', async () => {
    const disable = new DisableUsers({ count: 3 });

    await expect(disable.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('debería transformar correctamente el documento a JSON', async () => {
    const disableUsers = new DisableUsers({
      date: 'test-2025-05-21',
      count: 3,
      users: [userId1]
    });
    
    const saved = await disableUsers.save();
    const json = saved.toJSON();
    
    expect(json.id).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.date).toBe('test-2025-05-21');
    expect(json.count).toBe(3);
    expect(json.users.length).toBe(1);
    expect(json.users[0].toString()).toBe(userId1.toString());
  });
});

describe('SavedItemsStats Model Tests', () => {
  let userId, itemId;

  beforeAll(async () => {
    await connectDB();
    userId = new mongoose.Types.ObjectId();
    itemId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await SavedItemsStats.deleteMany({ date: /^test-/ });
    await disconnectDB();
  });

  it('debería permitir crear estadísticas con usuarios e items', async () => {
    const stat = new SavedItemsStats({
      date: 'test-2025-05-18',
      count: 1,
      users: [userId],
      items: [itemId]
    });

    const saved = await stat.save();

    expect(saved).toBeDefined();
    expect(saved.date).toBe('test-2025-05-18');
    expect(saved.count).toBe(1);
    expect(saved.users).toContainEqual(userId);
    expect(saved.items).toContainEqual(itemId);
  });

  it('debería usar valores por defecto cuando no se pasan users/items', async () => {
    const stat = new SavedItemsStats({ date: 'test-2025-05-19' });

    const saved = await stat.save();

    expect(saved.count).toBe(0);
    expect(saved.users.length).toBe(0);
    expect(saved.items.length).toBe(0);
  });

  it('no debería permitir crear estadísticas sin fecha', async () => {
    const stat = new SavedItemsStats({ count: 3 });

    await expect(stat.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('debería transformar correctamente el documento a JSON', async () => {
    const stat = new SavedItemsStats({
      date: 'test-2025-05-22',
      count: 2,
      users: [userId],
      items: [itemId]
    });
    
    const saved = await stat.save();
    const json = saved.toJSON();
    
    expect(json.id).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.date).toBe('test-2025-05-22');
    expect(json.count).toBe(2);
    expect(json.users.length).toBe(1);
    expect(json.users[0].toString()).toBe(userId.toString());
    expect(json.items.length).toBe(1);
    expect(json.items[0].toString()).toBe(itemId.toString());
  });
});
