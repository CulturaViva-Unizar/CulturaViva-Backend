const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  text: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, 
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
