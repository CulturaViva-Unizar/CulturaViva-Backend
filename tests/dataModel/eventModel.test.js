const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const { Item, Event, Place } = require('../../src/models/eventModel');

describe('Place Model Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });
  afterAll(async () => {
    await Place.deleteMany({ title: /^Test/ });
    await disconnectDB();
  });
  it('debería permitir crear un lugar con datos válidos', async () => {
    const place = new Place({
      title: 'Test Place',
      category: 'Museum',
      coordinates: { latitude: 48.8566, longitude: 2.3522 },
      direction: '456 Valid Street',
      openingHours: 'Weekend 10:00-18:00'
    });
  
    const savedPlace = await place.save();
  
    expect(savedPlace).toBeDefined();
    expect(savedPlace.title).toBe('Test Place');
    expect(savedPlace.category).toBe('Museum');
    expect(savedPlace.coordinates.latitude).toBe(48.8566);
    expect(savedPlace.coordinates.longitude).toBe(2.3522);
    expect(savedPlace.direction).toBe('456 Valid Street');
    expect(savedPlace.openingHours).toBe('Weekend 10:00-18:00');
  });
});

describe('Event Model Tests', () => {
  let place;

  beforeAll(async () => {
    await connectDB();

    place = new Place({
      title: 'Test Place',
      category: 'Test Category',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      direction: '123 Test Street',
      openingHours: 'Weekend 10:00-18:00'
    });

    await place.save();
  });

  afterAll(async () => {
    // Limpiar la base de datos
    await Event.deleteMany({ title: /^Test/ });
    await Place.deleteMany({ title: /^Test/ });
    await disconnectDB();
  });

  it('debería permitir crear un evento con datos válidos', async () => {
    const event = new Event({
      title: 'Test Event',
      category: 'Music',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      startDate: new Date('2025-03-25'),
      endDate: new Date('2025-03-26'),
      permanent: false,
      place: place._id
    });

    const savedEvent = await event.save();

    expect(savedEvent).toBeDefined();
    expect(savedEvent.title).toBe('Test Event');
    expect(savedEvent.category).toBe('Music');
    expect(savedEvent.coordinates.latitude).toBe(40.7128);
    expect(savedEvent.coordinates.longitude).toBe(-74.0060);
    expect(savedEvent.startDate).toEqual(new Date('2025-03-25'));
    expect(savedEvent.endDate).toEqual(new Date('2025-03-26'));
    expect(savedEvent.permanent).toBe(false);
    expect(savedEvent.place.toString()).toBe(place._id.toString());
  });

  it('debería permitir añadir asistentes a un evento', async () => {
    const event = new Event({
      title: 'Test event with Asistentes',
      category: 'Conference',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      startDate: new Date('2025-03-25'),
      endDate: new Date('2025-03-26'),
      permanent: false,
      place: place._id,
      asistentes: []
    });

    const savedEvent = await event.save();

    // Simular agregar asistentes
    const user1 = new mongoose.Types.ObjectId();
    const user2 = new mongoose.Types.ObjectId();
    savedEvent.asistentes.push(user1, user2);
    await savedEvent.save();

    const updatedEvent = await Event.findById(savedEvent._id);
    expect(updatedEvent.asistentes.length).toBe(2);
    expect(updatedEvent.asistentes).toContainEqual(user1);
    expect(updatedEvent.asistentes).toContainEqual(user2);
  });
});
