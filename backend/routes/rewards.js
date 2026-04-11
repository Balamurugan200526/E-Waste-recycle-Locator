/**
 * Rewards Store Routes
 * Browse rewards, redeem credits for coupons, view history
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/rewards - browse all active rewards
router.get('/', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true, availableStock: { $gt: 0 } };
    if (category && category !== 'All') query.category = category;

    const rewards = await Reward.find(query)
      .select('-couponCodes')  // never expose coupon codes in listing
      .sort({ creditCost: 1 });

    res.json({ rewards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// POST /api/rewards/redeem - spend credits to get a coupon
router.post('/redeem', authenticate, [
  body('rewardId').notEmpty().withMessage('Reward ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { rewardId } = req.body;

    // Load reward
    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive) {
      return res.status(404).json({ error: 'Reward not found or unavailable' });
    }
    if (reward.availableStock <= 0) {
      return res.status(400).json({ error: 'This reward is out of stock' });
    }

    // Check expiry
    if (reward.expiryDate && reward.expiryDate < new Date()) {
      return res.status(400).json({ error: 'This reward has expired' });
    }

    // Load fresh user
    const user = await User.findById(req.user._id);
    if (user.credits < reward.creditCost) {
      return res.status(400).json({
        error: `Insufficient credits. You need ${reward.creditCost} credits but have ${user.credits}.`
      });
    }

    // Find an available coupon code
    const couponIndex = reward.couponCodes.findIndex(c => !c.isUsed);
    if (couponIndex === -1) {
      return res.status(400).json({ error: 'No coupon codes available right now' });
    }

    const coupon = reward.couponCodes[couponIndex];

    // Deduct credits
    user.credits -= reward.creditCost;
    await user.save({ validateBeforeSave: false });

    // Mark coupon as used
    reward.couponCodes[couponIndex].isUsed = true;
    reward.couponCodes[couponIndex].usedBy = user._id;
    reward.couponCodes[couponIndex].usedAt = new Date();
    reward.availableStock -= 1;
    reward.totalRedeemed += 1;
    await reward.save();

    // Create redemption record
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // 30 days to use

    const redemption = new Redemption({
      user: user._id,
      reward: reward._id,
      couponCode: coupon.code,
      creditsSpent: reward.creditCost,
      platform: reward.platform,
      discountValue: reward.discountValue,
      expiresAt: reward.expiryDate || expiry
    });
    await redemption.save();

    // Notify user
    const notification = new Notification({
      user: user._id,
      title: `🎁 Coupon Redeemed!`,
      message: `You got ${reward.discountValue} on ${reward.platform}. Code: ${coupon.code}`,
      type: 'credit',
      data: { couponCode: coupon.code, platform: reward.platform }
    });
    await notification.save();

    // Real-time update
    const io = req.app.get('io');
    io.to(`user_${user._id}`).emit('credits_updated', {
      credits: user.credits,
      change: -reward.creditCost,
      notification: { title: notification.title, message: notification.message }
    });

    res.json({
      message: 'Coupon redeemed successfully!',
      redemption: {
        _id: redemption._id,
        couponCode: coupon.code,
        platform: reward.platform,
        discountValue: reward.discountValue,
        creditsSpent: reward.creditCost,
        remainingCredits: user.credits,
        expiresAt: redemption.expiresAt
      }
    });

  } catch (error) {
    console.error('Redeem error:', error);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

// GET /api/rewards/my - user's redemption history
router.get('/my', authenticate, async (req, res) => {
  try {
    const redemptions = await Redemption.find({ user: req.user._id })
      .populate('reward', 'title platform platformLogo discountValue category')
      .sort({ createdAt: -1 });

    res.json({ redemptions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
});

// ── Admin routes ────────────────────────────────────────────────────────────

// GET /api/rewards/admin/all - all rewards with stock info
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ createdAt: -1 });
    res.json({ rewards });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// POST /api/rewards/admin/create - create a new reward
router.post('/admin/create', authenticate, requireAdmin, [
  body('title').notEmpty().withMessage('Title required'),
  body('platform').notEmpty().withMessage('Platform required'),
  body('creditCost').isInt({ min: 1 }).withMessage('Credit cost must be at least 1'),
  body('discountValue').notEmpty().withMessage('Discount value required'),
  body('couponCodes').isArray({ min: 1 }).withMessage('At least one coupon code required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

    const { title, description, category, platform, platformLogo, creditCost,
            discountValue, couponCodes, expiryDate, minOrderValue, termsAndConditions } = req.body;

    // Format coupon codes
    const formattedCodes = couponCodes.map(code =>
      typeof code === 'string' ? { code: code.trim(), isUsed: false } : code
    );

    const reward = new Reward({
      title, description, category, platform,
      platformLogo: platformLogo || '🛍️',
      creditCost, discountValue,
      couponCodes: formattedCodes,
      totalStock: formattedCodes.length,
      availableStock: formattedCodes.length,
      expiryDate: expiryDate || null,
      minOrderValue: minOrderValue || null,
      termsAndConditions: termsAndConditions || ''
    });

    await reward.save();
    res.status(201).json({ message: 'Reward created', reward });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// PATCH /api/rewards/admin/:id/toggle - activate/deactivate
router.patch('/admin/:id/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });
    reward.isActive = !reward.isActive;
    await reward.save();
    res.json({ message: `Reward ${reward.isActive ? 'activated' : 'deactivated'}`, isActive: reward.isActive });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// POST /api/rewards/admin/:id/add-codes - add more coupon codes
router.post('/admin/:id/add-codes', authenticate, requireAdmin, [
  body('codes').isArray({ min: 1 }).withMessage('At least one code required')
], async (req, res) => {
  try {
    const { codes } = req.body;
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });

    const newCodes = codes.map(c => ({ code: c.trim(), isUsed: false }));
    reward.couponCodes.push(...newCodes);
    reward.totalStock += newCodes.length;
    reward.availableStock += newCodes.length;
    await reward.save();

    res.json({ message: `Added ${newCodes.length} coupon codes`, availableStock: reward.availableStock });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add codes' });
  }
});

// DELETE /api/rewards/admin/:id - delete reward
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Reward.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reward deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

module.exports = router;
