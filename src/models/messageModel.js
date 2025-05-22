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
}, {
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
    versionKey: false
  },
}
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
