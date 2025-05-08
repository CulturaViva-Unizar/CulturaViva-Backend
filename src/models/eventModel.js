const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coordinatesSchema = new Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { _id: false });

const priceSchema = new Schema({
  grupo: {
    type: String,
    required: false
  },
  precio: {
    type: Number,
    required: false
  },
}, { _id: false });

const itemSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  instagram: {
    type: String,
    required: false
  },
  twitter: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  price: {
    type: [priceSchema],
    required: false
  },
  coordinates: {
    type: coordinatesSchema,
    required: false
  },
}, {discriminatorKey: 'itemType'});

const Item = mongoose.model('Item', itemSchema);

const eventSchema = new Schema({
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  permanent: {
    type: Boolean,
    required: false
  },
  place: {
    type: String,
    /*type: Schema.Types.ObjectId,
    ref: 'Place',*/
    required: false
  },
  asistentes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Event = Item.discriminator('Event', eventSchema);

const placeSchema = new Schema({
  direction: {
    type: String,
    required: false
  },
  openingHours: {
    type: String,
    //type: daySchema,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
});

const Place = Item.discriminator('Place', placeSchema);

module.exports = { Item, Event, Place };
