/**
 * Recycle Transaction Routes
 * Submit recycling requests, generate QR codes, verify transactions
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const RecycleTransaction = require('../models/RecycleTransaction');
const RecycleCenter = require('../models/RecycleCenter');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticate, requireAdmin } = require('../middleware/auth');

const MAX_DISTANCE_METERS = 500; // 500m GPS fraud detection radius

// POST /api/recycle/submit - user submits recycling request
router.post('/submit', authenticate, [
  body('centerId').notEmpty().withMessage('Center ID required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.name').notEmpty().withMessage('Item name required'),
  body('items.*.category').notEmpty().withMessage('Item category required'),
  body('items.*.weight').isFloat({ min: 0.01 }).withMessage('Valid weight required'),
  body('userLocation.latitude').optional().isFloat({ min: -90, max: 90 }),
  body('userLocation.longitude').optional().isFloat({ min: -180, max: 180 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { centerId, items, userLocation } = req.body;

    const center = await RecycleCenter.findById(centerId);
    if (!center || !center.isActive) {
      return res.status(404).json({ error: 'Recycling center not found' });
    }

    // Calculate total weight and credits
    const totalWeight = items.reduce((sum, item) => sum + parseFloat(item.weight), 0);
    const creditsEarned = Math.floor(totalWeight * center.creditsPerKg);

    // GPS validation (if location provided)
    let isLocationValid = null;
    let distanceFromCenter = null;

    if (userLocation?.latitude && userLocation?.longitude) {
      distanceFromCenter = haversineMeters(
        userLocation.latitude, userLocation.longitude,
        center.location.coordinates[1], center.location.coordinates[0]
      );
      isLocationValid = distanceFromCenter <= MAX_DISTANCE_METERS;
    }

    // Generate verification token
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate QR code — encodes a URL so scanning opens the verify page directly
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    const qrData = `${CLIENT_URL}/verify/${verificationToken}`;
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300,
      color: { dark: '#000000', light: '#ffffff' }
    });

    // Create transaction
    const transaction = new RecycleTransaction({
      user: req.user._id,
      center: centerId,
      items,
      totalWeight: parseFloat(totalWeight.toFixed(2)),
      creditsEarned,
      status: 'qr_generated',
      qrCode: {
        data: qrCodeImage,
        token: verificationToken,
        expiresAt
      },
      userLocation: userLocation || {},
      centerLocation: {
        latitude: center.location.coordinates[1],
        longitude: center.location.coordinates[0]
      },
      distanceFromCenter,
      isLocationValid
    });

    await transaction.save();

    // Notification
    const notification = new Notification({
      user: req.user._id,
      title: 'QR Code Generated! 📱',
      message: `Show this QR code at ${center.name} to earn ${creditsEarned} credits.`,
      type: 'recycle',
      data: { transactionId: transaction._id }
    });
    await notification.save();

    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('transaction_created', {
      transaction: transaction._id,
      creditsEarned,
      notification: { title: notification.title, message: notification.message }
    });

    res.status(201).json({
      message: 'Recycling request submitted',
      transaction: {
        _id: transaction._id,
        transactionId: transaction.transactionId,
        status: transaction.status,
        creditsEarned,
        totalWeight,
        centerName: center.name,
        qrCode: qrCodeImage,
        verificationToken,
        isLocationValid,
        distanceFromCenter
      }
    });
  } catch (error) {
    console.error('Submit recycle error:', error);
    res.status(500).json({ error: 'Failed to submit recycling request' });
  }
});

// POST /api/recycle/verify-scan - PUBLIC route for mobile QR scan + codeword
// No auth required — protected by secret codeword instead
router.post('/verify-scan', async (req, res) => {
  try {
    const { token, codeword } = req.body;

    if (!token) return res.status(400).json({ error: 'QR token missing' });
    if (!codeword) return res.status(400).json({ error: 'Codeword is required' });

    // Check secret codeword (set in .env as VERIFY_CODEWORD)
    const SECRET = process.env.VERIFY_CODEWORD || 'ecycle123';
    if (codeword.trim().toLowerCase() !== SECRET.toLowerCase()) {
      return res.status(403).json({ error: 'Incorrect codeword. Please try again.' });
    }

    const transaction = await RecycleTransaction.findOne({ 'qrCode.token': token })
      .populate('user', 'name email credits')
      .populate('center', 'name');

    if (!transaction) {
      return res.status(404).json({ error: 'Invalid QR code. Not found.' });
    }
    if (transaction.status === 'completed') {
      return res.status(400).json({
        error: 'Already verified',
        alreadyDone: true,
        user: transaction.user?.name,
        creditsEarned: transaction.creditsEarned
      });
    }
    if (transaction.qrCode.expiresAt < new Date()) {
      transaction.status = 'rejected';
      transaction.rejectionReason = 'QR code expired';
      await transaction.save();
      return res.status(400).json({ error: 'QR code has expired (valid 24 hours only).' });
    }

    // Award credits
    const user = await User.findById(transaction.user._id);
    user.credits += transaction.creditsEarned;
    user.totalRecycled += 1;
    user.totalItemsWeight += transaction.totalWeight;
    await user.save({ validateBeforeSave: false });

    // Update center stats
    await RecycleCenter.findByIdAndUpdate(
      transaction.center._id,
      { $inc: { totalItemsReceived: transaction.items.length } }
    );

    // Complete transaction
    transaction.status = 'completed';
    transaction.verifiedAt = new Date();
    await transaction.save();

    // Notify user in real time via WebSocket
    const Notification = require('../models/Notification');
    const notification = new Notification({
      user: user._id,
      title: `✅ +${transaction.creditsEarned} Credits Earned!`,
      message: `Your recycling at ${transaction.center.name} was verified. Credits added!`,
      type: 'credit',
      data: { creditsEarned: transaction.creditsEarned }
    });
    await notification.save();

    const io = req.app.get('io');
    io.to(`user_${user._id}`).emit('credits_updated', {
      credits: user.credits,
      change: transaction.creditsEarned,
      notification: { title: notification.title, message: notification.message }
    });

    res.json({
      success: true,
      message: 'Verified! Credits awarded.',
      userName: user.name,
      creditsEarned: transaction.creditsEarned,
      totalCredits: user.credits,
      centerName: transaction.center.name,
      totalWeight: transaction.totalWeight
    });

  } catch (error) {
    console.error('Verify scan error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});



router.post('/verify', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Verification token required' });

    const transaction = await RecycleTransaction.findOne({ 'qrCode.token': token })
      .populate('user', 'name email credits')
      .populate('center', 'name');

    if (!transaction) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    if (transaction.status === 'completed') {
      return res.status(400).json({ error: 'QR code already verified' });
    }

    if (transaction.qrCode.expiresAt < new Date()) {
      transaction.status = 'rejected';
      transaction.rejectionReason = 'QR code expired';
      await transaction.save();
      return res.status(400).json({ error: 'QR code has expired' });
    }

    // Award credits to user
    const user = await User.findById(transaction.user._id);
    user.credits += transaction.creditsEarned;
    user.totalRecycled += 1;
    user.totalItemsWeight += transaction.totalWeight;
    await user.save({ validateBeforeSave: false });

    // Update center stats
    await RecycleCenter.findByIdAndUpdate(
      transaction.center._id,
      { $inc: { totalItemsReceived: transaction.items.length } }
    );

    // Update transaction
    transaction.status = 'completed';
    transaction.verifiedAt = new Date();
    transaction.verifiedBy = req.user._id;
    await transaction.save();

    // Notify user
    const notification = new Notification({
      user: user._id,
      title: `✅ +${transaction.creditsEarned} Credits Earned!`,
      message: `Your recycling at ${transaction.center.name} has been verified. Keep going!`,
      type: 'credit',
      data: { creditsEarned: transaction.creditsEarned }
    });
    await notification.save();

    const io = req.app.get('io');
    io.to(`user_${user._id}`).emit('credits_updated', {
      credits: user.credits,
      change: transaction.creditsEarned,
      notification: { title: notification.title, message: notification.message }
    });
    io.to('admin_room').emit('transaction_verified', {
      transactionId: transaction._id,
      user: { name: user.name, email: user.email },
      creditsEarned: transaction.creditsEarned
    });

    res.json({
      message: 'Transaction verified successfully!',
      creditsEarned: transaction.creditsEarned,
      user: { name: user.name, totalCredits: user.credits }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET /api/recycle/my - user's own transactions
router.get('/my', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      RecycleTransaction.find({ user: req.user._id })
        .populate('center', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      RecycleTransaction.countDocuments({ user: req.user._id })
    ]);

    res.json({ transactions, pagination: { page, limit, total } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/recycle/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: 'user', isActive: true })
      .select('name credits totalRecycled totalItemsWeight createdAt')
      .sort({ credits: -1 })
      .limit(20);

    res.json({ leaderboard: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/recycle/scan/:token - PUBLIC (no auth) - preview before verifying
// MUST be before /:id so Express matches it first
router.get('/scan/:token', async (req, res) => {
  try {
    const transaction = await RecycleTransaction.findOne({
      'qrCode.token': req.params.token
    })
      .populate('user', 'name')
      .populate('center', 'name address');

    if (!transaction) {
      return res.status(404).json({ error: 'Invalid QR code. Please generate a new one.' });
    }

    res.json({
      valid: transaction.status !== 'completed' && transaction.qrCode.expiresAt > new Date(),
      status: transaction.status,
      expired: transaction.qrCode.expiresAt < new Date(),
      alreadyVerified: transaction.status === 'completed',
      preview: {
        userName: transaction.user?.name,
        centerName: transaction.center?.name,
        centerAddress: transaction.center?.address,
        creditsEarned: transaction.creditsEarned,
        totalWeight: transaction.totalWeight,
        itemCount: transaction.items?.length,
        expiresAt: transaction.qrCode.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transaction' });
  }
});

// GET /api/recycle/:id - get single transaction (authenticated)
// Keep this AFTER /scan/:token and /leaderboard
router.get('/:id', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };

    const transaction = await RecycleTransaction.findOne(query)
      .populate('user', 'name email')
      .populate('center', 'name address location');

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Haversine in meters
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = router;
