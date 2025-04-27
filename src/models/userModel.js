const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: { // para hacerlo RESTful 
    type: Date,
    default: Date.now
  }, 
  admin: {
    type: Boolean,
    default: false
  }, 
  active: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    required: true
  }, 
  chats: [{
    type: Schema.Types.ObjectId,
    ref: 'Chat'
  }], 
  asistsTo: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }], 
  savedItems: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }]
}, { discriminatorKey: 'userType' 
});

const User = mongoose.model('User', userSchema);

const UserPasswordSchema = new Schema({
  password: { type: String, required: true }
});

const UserPassword = User.discriminator("password", UserPasswordSchema);

const UserGoogleSchema = new Schema({
  googleId: { type: String, required: true }
});

const UserGoogle = User.discriminator("google", UserGoogleSchema);

const UserFacebookSchema = new Schema({
  facebookId: { type: String, required: true }
});

const UserFacebook = User.discriminator("facebook", UserFacebookSchema);

module.exports = { User, UserPassword, UserGoogle, UserFacebook };
