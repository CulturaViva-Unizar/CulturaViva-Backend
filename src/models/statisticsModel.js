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
});

const Visit = mongoose.model('Visit', visitSchema);

module.exports = { Visit };