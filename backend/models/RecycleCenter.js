/**
 * Recycle Center Model
 * E-waste collection points with geolocation
 */

const mongoose = require('mongoose');

const recycleCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Center name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: String,
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
  },
  acceptedItems: [{
    type: String,
    enum: [
      'Smartphones', 'Laptops', 'Tablets', 'Computers',
      'Printers', 'Monitors', 'TVs', 'Batteries',
      'Cables', 'Keyboards', 'Cameras', 'Gaming Consoles',
      'Refrigerators', 'Washing Machines', 'Air Conditioners', 'Other'
    ]
  }],
  creditsPerKg: {
    type: Number,
    default: 10 // Credits awarded per kg of e-waste
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalItemsReceived: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  image: String
}, {
  timestamps: true
});

// Geospatial index for proximity searches
recycleCenterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RecycleCenter', recycleCenterSchema);
