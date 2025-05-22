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

const disableUsersSchema = new mongoose.Schema({
  date: {
    type: String,
    unique: true,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
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

const DisableUsers = mongoose.model('DisableUsers', disableUsersSchema);

const savedItemsStatsSchema = new mongoose.Schema({
  date: {
    type: String,
    unique: true,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item',
    default: []
  }]
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

const SavedItemsStats = mongoose.model('SavedItemsStats', savedItemsStatsSchema)

module.exports = { Visit, DisableUsers, SavedItemsStats };