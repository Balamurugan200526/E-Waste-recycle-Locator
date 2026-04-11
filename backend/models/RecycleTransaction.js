/**
 * Recycle Transaction Model
 * Tracks each recycling event with QR verification
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const recycleTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: () => uuidv4()
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecycleCenter',
    required: true
  },
  items: [{
    name: { type: String, required: true },
    category: { type: String, required: true },
    weight: { type: Number, required: true, min: 0.1 }, // in kg
    condition: {
      type: String,
      enum: ['Working', 'Broken', 'Damaged', 'Parts Only'],
      default: 'Broken'
    }
  }],
  totalWeight: {
    type: Number,
    required: true,
    min: 0
  },
  creditsEarned: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'qr_generated', 'verified', 'completed', 'rejected'],
    default: 'pending'
  },
  qrCode: {
    data: String,    // Base64 QR code image
    token: String,   // Verification token
    expiresAt: Date
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // GPS validation data
  userLocation: {
    latitude: Number,
    longitude: Number
  },
  centerLocation: {
    latitude: Number,
    longitude: Number
  },
  distanceFromCenter: Number, // in meters
  isLocationValid: Boolean,   // Within acceptable range
  notes: String,
  rejectionReason: String
}, {
  timestamps: true
});

// Index for efficient queries
recycleTransactionSchema.index({ user: 1, createdAt: -1 });
recycleTransactionSchema.index({ center: 1 });
recycleTransactionSchema.index({ status: 1 });
recycleTransactionSchema.index({ 'qrCode.token': 1 });

module.exports = mongoose.model('RecycleTransaction', recycleTransactionSchema);
