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
  password: {
    type: String,
    required: false // si es de google no hace falta password creo
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
});

const User = mongoose.model('User', userSchema);

module.exports = User;
