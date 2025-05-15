const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }, 
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
    deleted: {
    type: Boolean,
    default: false
  },
  deleteAt: {
    type: Date,
    default: null
  }
}, {
  discriminatorKey: 'commentType',
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
    versionKey: false
  },
});

const Comment = mongoose.model('Comment', commentSchema);

const valorationSchema = new Schema({
  value: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: false
  }
});

const Valoration = Comment.discriminator('Valoration', valorationSchema);

const responseSchema = new Schema({
  responseTo:{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  }
});

const Response = Comment.discriminator('Response', responseSchema);

module.exports = { Comment, Valoration, Response };
