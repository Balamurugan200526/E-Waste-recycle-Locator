/**
 * Admin Routes
 * User management, analytics, credit management
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const RecycleTransaction = require('../models/RecycleTransaction');
const Notification = require('../models/Notification');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats - dashboard analytics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTransactions,
      completedTransactions,
      totalCreditsResult,
      recentUsers,
      recentTransactions
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      RecycleTransaction.countDocuments(),
      RecycleTransaction.countDocuments({ status: 'completed' }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$credits' } } }]),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('name email credits createdAt'),
      RecycleTransaction.find({ status: 'completed' }).sort({ createdAt: -1 }).limit(5)
        .populate('user', 'name email').populate('center', 'name')
    ]);

    const totalWeight = await RecycleTransaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalWeight' } } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalTransactions,
        completedTransactions,
        totalCreditsDistributed: totalCreditsResult[0]?.total || 0,
        totalWeightRecycled: totalWeight[0]?.total || 0
      },
      recentUsers,
      recentTransactions
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/users - all users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/credits - add/remove credits
router.patch('/users/:id/credits', [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('action').isIn(['add', 'remove']).withMessage('Action must be add or remove'),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { amount, action, reason } = req.body;
    const creditAmount = Math.abs(Number(amount));

    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (action === 'add') {
      user.credits += creditAmount;
    } else {
      if (user.credits < creditAmount) {
        return res.status(400).json({ error: 'User does not have enough credits' });
      }
      user.credits -= creditAmount;
    }

    await user.save({ validateBeforeSave: false });

    // Send notification to user
    const notification = new Notification({
      user: user._id,
      title: action === 'add' ? `+${creditAmount} Credits Added! 🎉` : `${creditAmount} Credits Deducted`,
      message: reason || `Admin ${action === 'add' ? 'added' : 'removed'} ${creditAmount} credits from your account.`,
      type: 'credit',
      data: { amount: creditAmount, action }
    });
    await notification.save();

    // Real-time update to user
    const io = req.app.get('io');
    io.to(`user_${user._id}`).emit('credits_updated', {
      credits: user.credits,
      change: action === 'add' ? creditAmount : -creditAmount,
      notification: { title: notification.title, message: notification.message }
    });

    res.json({
      message: `Successfully ${action === 'add' ? 'added' : 'removed'} ${creditAmount} credits`,
      user: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// PATCH /api/admin/users/:id/status - activate/deactivate user
router.patch('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// GET /api/admin/transactions - all transactions
router.get('/transactions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      RecycleTransaction.find()
        .populate('user', 'name email')
        .populate('center', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RecycleTransaction.countDocuments()
    ]);

    res.json({ transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/admin/broadcast - broadcast notification to all users
router.post('/broadcast', [
  body('title').notEmpty().withMessage('Title required'),
  body('message').notEmpty().withMessage('Message required')
], async (req, res) => {
  try {
    const { title, message } = req.body;
    const users = await User.find({ role: 'user', isActive: true }).select('_id');

    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type: 'system'
    }));

    await Notification.insertMany(notifications);

    const io = req.app.get('io');
    io.emit('broadcast_notification', { title, message });

    res.json({ message: `Broadcast sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

module.exports = router;
