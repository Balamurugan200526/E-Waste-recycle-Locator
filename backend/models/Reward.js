/**
 * Reward Model
 * Store items users can redeem with credits
 */

const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Shopping', 'Food', 'Electronics', 'Fashion', 'Travel', 'Entertainment', 'Other'],
    default: 'Shopping'
  },
  platform: {
    type: String,
    required: true,
    trim: true  // e.g. "Amazon", "Flipkart", "Myntra"
  },
  platformLogo: {
    type: String,
    default: '🛍️'  // emoji logo
  },
  creditCost: {
    type: Number,
    required: true,
    min: 1
  },
  discountValue: {
    type: String,
    required: true  // e.g. "₹50 Off", "10% Off", "Free Shipping"
  },
  couponCodes: [{
    code: { type: String, required: true, trim: true },
    isUsed: { type: Boolean, default: false },
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    usedAt: { type: Date, default: null }
  }],
  totalStock: { type: Number, default: 0 },
  availableStock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date, default: null },
  minOrderValue: { type: String, default: null },  // e.g. "₹499"
  termsAndConditions: { type: String, default: '' },
  totalRedeemed: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reward', rewardSchema);
