const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const visitSchema = new mongoose.Schema({
  date: {
    type: String,
    unique: true,
    required: true
  },
  count: {
    type: Number,
    default: 0
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
});

const Visit = mongoose.model('Visit', visitSchema);

module.exports = { Visit };