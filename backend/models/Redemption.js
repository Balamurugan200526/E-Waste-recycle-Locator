/**
 * Redemption Model
 * Tracks credit-to-coupon redemptions
 */

const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  couponCode: {
    type: String,
    required: true
  },
  creditsSpent: {
    type: Number,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  discountValue: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

redemptionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Redemption', redemptionSchema);
