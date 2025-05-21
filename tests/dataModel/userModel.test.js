const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../src/config/db');
const { User, UserPassword, UserGoogle, UserFacebook, UserTwitter, UserGithub } = require('../../src/models/userModel');


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
  await UserTwitter.deleteMany({ email: /^test\./ });
  await UserGithub.deleteMany({ email: /^test\./ });
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
  
  it('Debe transformar correctamente a JSON eliminando _id y añadiendo id', async () => {
    const userData = {
      name: 'JSON Transform User',
      email: 'test.jsontransform@example.com',
      phone: '987654321'
    };
    const user = new User(userData);
    const savedUser = await user.save();
    
    const json = savedUser.toJSON();
    
    expect(json).toBeDefined();
    expect(json.id).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.name).toBe(userData.name);
    expect(json.email).toBe(userData.email);
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
  
  it('Debe fallar si falta el campo name', async () => {
    const userData = {
      email: 'test.noname@example.com',
      phone: '123000123'
    };
    const user = new User(userData);
    
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
  
  it('Debe fallar si falta el campo email', async () => {
    const userData = {
      name: 'No Email User',
      phone: '456000456'
    };
    const user = new User(userData);
    
    await expect(user.save()).rejects.toThrow(mongoose.Error.ValidationError);
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
    
    it('Debe crear un usuario con TwitterId (UserTwitter)', async () => {
      const userTwitter = new UserTwitter({
        name: 'Twitter User',
        email: 'test.twitter@example.com',
        phone: '111222000',
        twitterId: 'twitter-unique-id-789'
      });
      const saved = await userTwitter.save();
      expect(saved).toBeDefined();
      expect(saved.twitterId).toBe('twitter-unique-id-789');
      expect(saved.userType).toBe('twitter');
    });
    
    it('Debe crear un usuario con GithubId (UserGithub)', async () => {
      const userGithub = new UserGithub({
        name: 'Github User',
        email: 'test.github@example.com',
        phone: '000333666',
        githubId: 'github-unique-id-123'
      });
      const saved = await userGithub.save();
      expect(saved).toBeDefined();
      expect(saved.githubId).toBe('github-unique-id-123');
      expect(saved.userType).toBe('github');
    });
    
    it('Debe fallar al crear un UserTwitter sin twitterId', async () => {
      const userTwitter = new UserTwitter({
        name: 'No TwitterId User',
        email: 'test.notwitterid@example.com',
        phone: '999888777'
      });
      await expect(userTwitter.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
    
    it('Debe fallar al crear un UserGithub sin githubId', async () => {
      const userGithub = new UserGithub({
        name: 'No GithubId User',
        email: 'test.nogithubid@example.com',
        phone: '555444333'
      });
      await expect(userGithub.save()).rejects.toThrow(mongoose.Error.ValidationError);
    });
    
    it('Debe comprobar que los discriminadores funcionan correctamente al buscar', async () => {
      // Crear usuarios de diferentes tipos
      const passUser = await new UserPassword({
        name: 'Search Pass User',
        email: 'test.searchpass@example.com',
        phone: '123123123',
        password: 'searchpass'
      }).save();
      
      // Buscar y verificar el tipo correcto
      const foundUser = await User.findById(passUser._id);
      expect(foundUser).toBeDefined();
      expect(foundUser.userType).toBe('password');
      expect(foundUser instanceof UserPassword).toBeTruthy();
      
      // Comprobar transformación JSON en discriminadores
      const json = foundUser.toJSON();
      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
      expect(json.password).toBe('searchpass');
    });
  });
});
