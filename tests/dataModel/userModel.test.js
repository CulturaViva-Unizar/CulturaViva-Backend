const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const { User, UserPassword, UserGoogle, UserFacebook } = require('../../src/models/userModel');


/******************************************************************
* Test para probar el modelo de datos de usuario.                 *
* Pertenece a la suite de tests "dataModel", que realiza pruebas  *
* con la base de datos real.                                      *               
*******************************************************************/

beforeAll(async () => {
  await connectDB();

  // Limpio usuarios de prueba para evitar conflictos
  await User.deleteMany({ email: /^test\./ });
  await UserPassword.deleteMany({ email: /^test\./ });
  await UserGoogle.deleteMany({ email: /^test\./ });
  await UserFacebook.deleteMany({ email: /^test\./ });
});

afterAll(async () => {
  await disconnectDB();
});

describe('Modelo User y sus discriminators', () => {
  it('Debe crear un usuario básico con los datos mínimos', async () => {
    const userData = {
      name: 'Test User',
      email: 'test.user@example.com',
      phone: '123456789'
    };
    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.phone).toBe(userData.phone);
    expect(savedUser.admin).toBe(false);
    expect(savedUser.active).toBe(true);
    expect(savedUser.createdAt).toBeDefined();
  });

  it('Debe fallar si falta el campo phone', async () => {
    const userData = {
      name: 'No Phone User',
      email: 'test.nophone@example.com'
    };
    const user = new User(userData);
    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
    expect(error.errors.phone).toBeDefined();
  });

  it('Debe permitir agregar chats, items, eventos y comentarios', async () => {
    const userData = {
      name: 'Relations User',
      email: 'test.relations@example.com',
      phone: '5551234567',
    };
    const user = new User(userData);
    const savedUser = await user.save();

    const chatId = new mongoose.Types.ObjectId();
    const itemId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();
    const commentId = new mongoose.Types.ObjectId();

    savedUser.chats.push(chatId);
    savedUser.savedItems.push(itemId);
    savedUser.asistsTo.push(eventId);
    savedUser.comments.push(commentId);

    const updatedUser = await savedUser.save();

    expect(updatedUser.chats).toContainEqual(chatId);
    expect(updatedUser.savedItems).toContainEqual(itemId);
    expect(updatedUser.asistsTo).toContainEqual(eventId);
    expect(updatedUser.comments).toContainEqual(commentId);
  });

  describe('Discriminators', () => {
    it('Debe crear un usuario con contraseña (UserPassword)', async () => {
      const userPass = new UserPassword({
        name: 'Pass User',
        email: 'test.pass@example.com',
        phone: '111222333',
        password: 'supersecret'
      });
      const saved = await userPass.save();
      expect(saved).toBeDefined();
      expect(saved.password).toBe('supersecret');
      expect(saved.userType).toBe('password');
    });

    it('Debe crear un usuario con GoogleId (UserGoogle)', async () => {
      const userGoogle = new UserGoogle({
        name: 'Google User',
        email: 'test.google@example.com',
        phone: '444555666',
        googleId: 'google-unique-id-123'
      });
      const saved = await userGoogle.save();
      expect(saved).toBeDefined();
      expect(saved.googleId).toBe('google-unique-id-123');
      expect(saved.userType).toBe('google');
    });

    it('Debe crear un usuario con FacebookId (UserFacebook)', async () => {
      const userFacebook = new UserFacebook({
        name: 'Facebook User',
        email: 'test.facebook@example.com',
        phone: '777888999',
        facebookId: 'fb-unique-id-456'
      });
      const saved = await userFacebook.save();
      expect(saved).toBeDefined();
      expect(saved.facebookId).toBe('fb-unique-id-456');
      expect(saved.userType).toBe('facebook');
    });

    it('Debe fallar al crear un UserGoogle sin googleId', async () => {
      const userGoogle = new UserGoogle({
        name: 'No GoogleId User',
        email: 'test.nogoogleid@example.com',
        phone: '000111222'
      });
      await expect(userGoogle.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('Debe fallar al crear un UserFacebook sin facebookId', async () => {
      const userFacebook = new UserFacebook({
        name: 'No FacebookId User',
        email: 'test.nofacebookid@example.com',
        phone: '333444555'
      });
      await expect(userFacebook.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('Debe fallar al crear un UserPassword sin password', async () => {
      const userPass = new UserPassword({
        name: 'No Pass User',
        email: 'test.nopass@example.com',
        phone: '666777888'
      });
      await expect(userPass.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
  });
});
