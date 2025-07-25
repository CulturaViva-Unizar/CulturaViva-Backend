const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  user1:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, 
  user2:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: function (value) {
        return value.toString() !== this.user1.toString();
      },
      message: 'user1 y user2 deben ser distintos'
    }
  },
  mensajes: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
}, {
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
    versionKey: false
  },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
