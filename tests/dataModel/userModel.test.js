const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const User = require('../../src/models/userModel');

/******************************************************************
* Test para probar el modelo de datos de usuario.                 *
* Pertenece a la suite de tests "dataModel", que realiza pruebas  *
* con la base de datos real.                                      *               
*******************************************************************/

beforeAll(async () => {
  await connectDB();
  // si john doe existe lo funo de la base de datos para evitar errores (ya que usamos la bd real)
  await User.deleteOne({ email: 'john.doe@example.com' });
  await User.deleteOne({ email: 'event.user@example.com' });
  await User.deleteOne({ email: 'chat.user@example.com' });
  await User.deleteOne({ email: 'item.user@example.com' });
});

afterAll(async () => {
  await disconnectDB();
});

describe('Modelo User', () => {
  it('Debe crear un nuevo usuario con los datos mínimos', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123456789',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser).toBeDefined();
    expect(savedUser.name).toBe('John Doe');
    expect(savedUser.email).toBe('john.doe@example.com');
    expect(savedUser.phone).toBe('123456789');
    expect(savedUser.createdAt).toBeDefined(); 
    expect(savedUser.admin).toBe(false); 
    expect(savedUser.active).toBe(true); 
  });

  it('Debe generar un error si el email ya existe (campo único)', async () => {
    const userData = {
      name: 'Jane Doe',
      email: 'john.doe@example.com',
      phone: '987654321',
    };

    const user = new User(userData);

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000);
  });

  it('Debe fallar si el campo phone es obligatorio', async () => {
    const userData = {
      name: 'Invalid User',
      email: 'invalid.user@example.com',
    };

    const user = new User(userData);

    let error;
    try {
      await user.save();  // Intentar guardar el usuario sin un teléfono
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.phone).toBeDefined(); 
  });

  it('Debe poder agregar un chat a un usuario', async () => {
    const userData = {
      name: 'Chat User',
      email: 'chat.user@example.com',
      phone: '5551234567',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    const chatId = new mongoose.Types.ObjectId();
    savedUser.chats.push(chatId);

    const updatedUser = await savedUser.save();

    expect(updatedUser.chats.length).toBe(1); 
    expect(updatedUser.chats[0].toString()).toBe(chatId.toString());
  });

  it('Debe poder agregar un item a la lista de items guardados', async () => {
    const userData = {
      name: 'Item User',
      email: 'item.user@example.com',
      phone: '5559876543',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    const itemId = new mongoose.Types.ObjectId(); 
    savedUser.savedItems.push(itemId); 

    const updatedUser = await savedUser.save();

    expect(updatedUser.savedItems.length).toBe(1); 
    expect(updatedUser.savedItems[0].toString()).toBe(itemId.toString());
  });

  it('Debe poder agregar un evento a la lista de eventos a los que asiste', async () => {
    const userData = {
      name: 'Event User',
      email: 'event.user@example.com',
      phone: '5552223333',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    const eventId = new mongoose.Types.ObjectId(); 
    savedUser.asistsTo.push(eventId); 

    const updatedUser = await savedUser.save();

    expect(updatedUser.asistsTo.length).toBe(1);
    expect(updatedUser.asistsTo[0].toString()).toBe(eventId.toString()); 
  });
});
