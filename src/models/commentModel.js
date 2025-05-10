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
}, {discriminatorKey: 'commentType'});

const Comment = mongoose.model('Comment', commentSchema);

const valorationSchema = new Schema({
  value: {
    type: Number,
    required: true
  },
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
